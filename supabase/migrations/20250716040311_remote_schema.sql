

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."group_type" AS ENUM (
    'team',
    'pod',
    'session'
);


ALTER TYPE "public"."group_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."count_active_players"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    active_count integer;
BEGIN
    SELECT COUNT(*)
    INTO active_count
    FROM players
    WHERE is_demo = false;

    RETURN active_count;
END;
$$;


ALTER FUNCTION "public"."count_active_players"() OWNER TO "supabase_read_only_user";


CREATE OR REPLACE FUNCTION "public"."get_current_coach_attributes"() RETURNS TABLE("coach_auth_uid" "uuid", "org_id" "uuid", "is_admin" boolean, "is_superadmin" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    _auth_uid uuid := auth.uid();
BEGIN
  RETURN QUERY
  SELECT
      c.auth_uid,
      c.org_id,
      c.is_admin,
      c.is_superadmin
  FROM
      public.coaches c
  WHERE
      c.auth_uid = _auth_uid;
END;
$$;


ALTER FUNCTION "public"."get_current_coach_attributes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_organization_access"() RETURNS TABLE("org_id" "uuid", "role_name" "text", "is_superadmin" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.organization_id,
        pr.role,
        COALESCE(p.person_type = 'superadmin', FALSE)
    FROM person p
    LEFT JOIN person_role pr ON pr.person_id = p.id AND pr.active = TRUE
    WHERE p.auth_user_id = auth.uid()
    AND p.active = TRUE;
END;
$$;


ALTER FUNCTION "public"."get_user_organization_access"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS TABLE("person_id" "uuid", "organization_id" "uuid", "role" "text", "is_superadmin" boolean, "is_admin" boolean, "team_ids" "uuid"[])
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as person_id,
    p.organization_id,
    COALESCE(pr.role, 'player') as role,
    COALESCE(p.is_superadmin, false) as is_superadmin,
    COALESCE(p.is_admin, false) as is_admin,
    -- For team_ids, we want actual team assignments, not organization IDs
    CASE 
        WHEN pr.role = 'superadmin' THEN 
            -- Superadmins can see all teams across all organizations
            ARRAY(SELECT DISTINCT id FROM mp_core_group)
        WHEN pr.role = 'admin' THEN 
            -- Admins can see all teams in their organization
            ARRAY(SELECT DISTINCT id FROM mp_core_group WHERE organization_id = p.organization_id)
        ELSE 
            -- Coaches and players see their assigned teams
            COALESCE(
                ARRAY(
                    SELECT DISTINCT mpg.group_id 
                    FROM mp_core_person_group mpg 
                    WHERE mpg.person_id = p.id 
                    AND COALESCE(mpg.status, 'active') = 'active'
                    AND mpg.group_id IS NOT NULL
                ),
                ARRAY[]::uuid[]
            )
    END as team_ids
  FROM mp_core_person p
  LEFT JOIN mp_person_role pr ON pr.person_id = p.id AND pr.active = true
  WHERE p.user_id = auth.uid()
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO mp_core_person (id, user_id, display_name, organization_id, person_type)
  VALUES (gen_random_uuid(), NEW.id, NEW.email, '<your-org-id>', 'coach');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_org_admin"("p_org_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM mp_core_person
    WHERE organization_id = p_org_id
      AND auth_uid = p_user_id
      AND is_admin = true
  );
END;
$$;


ALTER FUNCTION "public"."is_org_admin"("p_org_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO activity_log (player_id, observation_id, activity_type, summary, created_at)
  VALUES (
    NEW.player_id,
    NEW.id,
    'observation',
    NEW.content,
    NOW()
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_observation_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO activity_log (player_id, observation_id, activity_type, summary, created_at)
  VALUES (
    NEW.player_id,
    NEW.id,
    'observation',
    NEW.content,
    NOW()
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_observation_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_pdp_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO activity_log (player_id, pdp_id, activity_type, summary, created_at)
  VALUES (
    NEW.player_id,
    NEW.id,
    'pdp_update',
    NEW.content,
    NOW()
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_pdp_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_null_start_date"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE pdp
    SET start_date = created_at
    WHERE start_date IS NULL;
END;
$$;


ALTER FUNCTION "public"."set_null_start_date"() OWNER TO "supabase_read_only_user";


CREATE OR REPLACE FUNCTION "public"."update_dashboard_config_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_dashboard_config_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_development_goals_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_development_goals_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_development_plan_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_development_plan_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_groups_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_groups_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_observations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_observations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_organization_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_organization_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_person_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_person_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_reflection_log_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_reflection_log_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_sessions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_sessions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_system_settings_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_system_settings_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."infrastructure_program_cycle" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "name" "text" NOT NULL,
    "year" integer NOT NULL,
    "term" "text",
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "description" "text",
    "objectives" "text"[],
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."infrastructure_program_cycle" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mp_core_group" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "group_type" "text",
    "lead_person_id" "uuid",
    "organization_id" "uuid",
    "program" "text",
    "level_category" "text",
    "description" "text",
    "max_capacity" integer,
    "schedule" "jsonb",
    "active" boolean DEFAULT true,
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."mp_core_group" OWNER TO "postgres";


COMMENT ON TABLE "public"."mp_core_group" IS 'Group table with simplified RLS policies that allow:
1. All authenticated users to read groups
2. Users to update/insert groups in their organization
3. Admins to perform all operations on all groups';



CREATE TABLE IF NOT EXISTS "public"."mp_core_person" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "first_name" "text",
    "last_name" "text",
    "email" "text",
    "phone" "text",
    "notes" "text",
    "person_type" "text",
    "organization_id" "uuid",
    "is_admin" boolean DEFAULT false,
    "is_superadmin" boolean DEFAULT false,
    "active" boolean DEFAULT true,
    "date_of_birth" "date",
    "emergency_contact" "jsonb",
    "profile_image_url" "text",
    "medical_info" "jsonb",
    "parent_guardian_info" "jsonb",
    "created_by" "uuid",
    "updated_by" "uuid",
    "auth_uid" "uuid",
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "stripe_product_id" "text",
    "plan_name" "text",
    "subscription_status" "text",
    "seats_purchased" integer DEFAULT 1,
    "seats_used" integer DEFAULT 1
);


ALTER TABLE "public"."mp_core_person" OWNER TO "postgres";


COMMENT ON TABLE "public"."mp_core_person" IS 'Core person table with simplified RLS policies that allow:
1. All authenticated users to read person records
2. Users to update their own records
3. Users to insert records with their own auth_uid
4. Admins to perform all operations on all records';



COMMENT ON COLUMN "public"."mp_core_person"."person_type" IS 'Type of person: coach, player, admin, parent';



COMMENT ON COLUMN "public"."mp_core_person"."organization_id" IS 'Organization this person belongs to';



COMMENT ON COLUMN "public"."mp_core_person"."auth_uid" IS 'Supabase auth user ID';



CREATE TABLE IF NOT EXISTS "public"."mp_core_person_group" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "person_id" "uuid",
    "group_id" "uuid",
    "role" "text" NOT NULL,
    "organization_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "cycle_id" "uuid",
    "position" "text",
    "identifier" "text",
    "status" "text" DEFAULT 'active'::"text",
    "metadata" "jsonb",
    "joined_at" timestamp with time zone DEFAULT "now"(),
    "left_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_at" timestamp with time zone,
    "payer_id" "uuid"
);


ALTER TABLE "public"."mp_core_person_group" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."current_participants" WITH ("security_invoker"='on') AS
 SELECT "p"."id",
    "p"."first_name",
    "p"."last_name",
    "p"."email",
    "p"."person_type",
    "p"."auth_uid",
    "pg"."group_id",
    "g"."name" AS "group_name",
    "pg"."role",
    "pg"."position",
    "pg"."identifier",
    "pc"."name" AS "cycle_name",
    "p"."organization_id"
   FROM ((("public"."mp_core_person" "p"
     JOIN "public"."mp_core_person_group" "pg" ON (("p"."id" = "pg"."person_id")))
     JOIN "public"."mp_core_group" "g" ON (("pg"."group_id" = "g"."id")))
     LEFT JOIN "public"."infrastructure_program_cycle" "pc" ON (("pg"."cycle_id" = "pc"."id")))
  WHERE ("g"."active" = true);


ALTER TABLE "public"."current_participants" OWNER TO "supabase_read_only_user";


CREATE TABLE IF NOT EXISTS "public"."infrastructure_activity_logs" (
    "action" "text" NOT NULL,
    "timestamp" timestamp without time zone DEFAULT "now"() NOT NULL,
    "ip_address" character varying(45),
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "person_id" "uuid",
    "organization_id" "uuid"
);


ALTER TABLE "public"."infrastructure_activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."infrastructure_dashboard_config" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "person_id" "uuid",
    "dashboard_type" "text" NOT NULL,
    "widget_config" "jsonb" NOT NULL,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid"
);


ALTER TABLE "public"."infrastructure_dashboard_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."infrastructure_file_storage" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "file_name" "text" NOT NULL,
    "original_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "file_size" integer,
    "bucket_name" "text" NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "uploaded_by" "uuid",
    "description" "text",
    "tags" "text"[],
    "public_access" boolean DEFAULT false,
    "thumbnail_path" "text",
    "processing_status" "text" DEFAULT 'uploaded'::"text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid"
);


ALTER TABLE "public"."infrastructure_file_storage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."infrastructure_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" NOT NULL,
    "invited_by" "uuid" NOT NULL,
    "invited_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "status" "text" NOT NULL
);


ALTER TABLE "public"."infrastructure_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."infrastructure_invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "organization_id" "uuid",
    "role" "text" DEFAULT 'member'::"text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."infrastructure_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."infrastructure_memberships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "organization_id" "uuid",
    "role" "text" DEFAULT 'member'::"text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "memberships_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'member'::"text"])))
);


ALTER TABLE "public"."infrastructure_memberships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."infrastructure_notification_queue" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "notification_type" "text" NOT NULL,
    "subject" "text",
    "message" "text" NOT NULL,
    "data" "jsonb",
    "priority" integer DEFAULT 3,
    "status" "text" DEFAULT 'queued'::"text",
    "scheduled_for" timestamp with time zone DEFAULT "now"(),
    "sent_at" timestamp with time zone,
    "error_message" "text",
    "retry_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid"
);


ALTER TABLE "public"."infrastructure_notification_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."infrastructure_participation_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid",
    "person_id" "uuid",
    "status" "text" NOT NULL,
    "arrival_time" time without time zone,
    "departure_time" time without time zone,
    "participation_level" integer,
    "energy_level" integer,
    "focus_level" integer,
    "notes" "text",
    "absence_reason" "text",
    "advance_notice" boolean DEFAULT false,
    "makeup_required" boolean DEFAULT false,
    "metadata" "jsonb",
    "recorded_at" timestamp with time zone DEFAULT "now"(),
    "recorded_by" "uuid",
    "organization_id" "uuid"
);


ALTER TABLE "public"."infrastructure_participation_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."infrastructure_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "group_id" "uuid",
    "cycle_id" "uuid",
    "session_number" integer,
    "session_type" "text" DEFAULT 'regular'::"text",
    "date" "date" NOT NULL,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "location" "text",
    "session_objective" "text",
    "pre_session_notes" "text",
    "post_session_notes" "text",
    "facilitator_reflection" "text",
    "intensity_level" integer,
    "status" "text" DEFAULT 'planned'::"text",
    "expected_attendance" integer,
    "actual_attendance" integer,
    "conditions" "text",
    "equipment_issues" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "organization_id" "uuid"
);


ALTER TABLE "public"."infrastructure_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."infrastructure_system_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "category" "text" NOT NULL,
    "setting_key" "text" NOT NULL,
    "setting_value" "jsonb" NOT NULL,
    "description" "text",
    "data_type" "text" NOT NULL,
    "is_public" boolean DEFAULT false,
    "requires_restart" boolean DEFAULT false,
    "last_changed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."infrastructure_system_settings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."invitations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."invitations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."invitations_id_seq" OWNED BY "public"."infrastructure_invitations"."id";



CREATE TABLE IF NOT EXISTS "public"."mp_core_actions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "person_id" "uuid",
    "group_id" "uuid",
    "intention_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'planned'::character varying,
    "executed_at" timestamp with time zone,
    "duration_minutes" integer,
    "challenge_level" integer,
    "success_rate" numeric(5,2),
    "benchmark_assessments" "jsonb",
    "advancement_progress" "jsonb",
    "responsibility_progress" "jsonb",
    "challenge_rating" integer,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mp_core_actions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."mp_core_actions"."challenge_level" IS 'Challenge level of this action (1-5)';



COMMENT ON COLUMN "public"."mp_core_actions"."success_rate" IS 'Success rate achieved (0-1)';



COMMENT ON COLUMN "public"."mp_core_actions"."benchmark_assessments" IS 'Benchmarks assessed during this action';



COMMENT ON COLUMN "public"."mp_core_actions"."advancement_progress" IS 'Progress on advancement dimension';



COMMENT ON COLUMN "public"."mp_core_actions"."responsibility_progress" IS 'Progress on responsibility dimension';



CREATE TABLE IF NOT EXISTS "public"."mp_core_intentions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "person_id" "uuid",
    "group_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "target_date" "date",
    "status" "text" DEFAULT 'active'::character varying,
    "challenge_level" integer DEFAULT 3,
    "benchmark_targets" "jsonb",
    "development_stage" "text",
    "advancement_level" integer,
    "responsibility_tier" integer,
    "progress_percentage" integer DEFAULT 0,
    "domain_code" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "cla_category_focus" "text",
    "optimal_challenge_level" integer,
    "context_complexity_rating" integer
);


ALTER TABLE "public"."mp_core_intentions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."mp_core_intentions"."challenge_level" IS 'Initial challenge level (1-5)';



COMMENT ON COLUMN "public"."mp_core_intentions"."benchmark_targets" IS 'Target benchmarks for this intention';



COMMENT ON COLUMN "public"."mp_core_intentions"."development_stage" IS 'Stage in development arc';



COMMENT ON COLUMN "public"."mp_core_intentions"."advancement_level" IS 'Target advancement level for this intention';



COMMENT ON COLUMN "public"."mp_core_intentions"."responsibility_tier" IS 'Target responsibility tier for this intention';



CREATE TABLE IF NOT EXISTS "public"."mp_core_organizations" (
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" DEFAULT 'sports'::"text" NOT NULL,
    "description" "text",
    "logo_url" "text",
    "contact_info" "jsonb" DEFAULT '{}'::"jsonb",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "subscription_tier" "text" DEFAULT 'basic'::"text",
    "overlay_version" "text" DEFAULT 'mpbc-v1.0'::"text",
    "active" boolean DEFAULT true,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mp_core_organizations" OWNER TO "postgres";


COMMENT ON TABLE "public"."mp_core_organizations" IS 'Organization table with simplified RLS policies that allow:
1. All authenticated users to read organizations
2. Users to update organizations they belong to
3. Admins to perform all operations on all organizations';



CREATE TABLE IF NOT EXISTS "public"."mp_core_person_role" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "person_id" "uuid",
    "organization_id" "uuid",
    "role" "text" NOT NULL,
    "permissions" "text"[] DEFAULT '{}'::"text"[],
    "scope_type" "text",
    "scope_ids" "uuid"[],
    "active" boolean DEFAULT true,
    "started_at" timestamp with time zone DEFAULT "now"(),
    "ended_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."mp_core_person_role" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mp_core_reflections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "person_id" "uuid",
    "group_id" "uuid",
    "action_id" "uuid",
    "intention_id" "uuid",
    "content" "text" NOT NULL,
    "insights" "text",
    "next_steps" "text",
    "challenge_feedback" "text",
    "perceived_difficulty" integer,
    "development_insights" "jsonb",
    "benchmark_progress" "jsonb",
    "advancement_insights" "text",
    "responsibility_insights" "text",
    "collective_insights" "text",
    "advancement_progress" "jsonb",
    "responsibility_progress" "jsonb",
    "collective_progress" "jsonb",
    "confidence_score" integer,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mp_core_reflections" OWNER TO "postgres";


COMMENT ON COLUMN "public"."mp_core_reflections"."challenge_feedback" IS 'Feedback on challenge level';



COMMENT ON COLUMN "public"."mp_core_reflections"."perceived_difficulty" IS 'How difficult it felt (1-10)';



COMMENT ON COLUMN "public"."mp_core_reflections"."development_insights" IS 'Insights related to development arc';



COMMENT ON COLUMN "public"."mp_core_reflections"."benchmark_progress" IS 'Progress toward benchmarks';



COMMENT ON COLUMN "public"."mp_core_reflections"."advancement_insights" IS 'Insights on advancement dimension';



COMMENT ON COLUMN "public"."mp_core_reflections"."responsibility_insights" IS 'Insights on responsibility dimension';



COMMENT ON COLUMN "public"."mp_core_reflections"."collective_insights" IS 'Insights on collective growth dimension';



CREATE TABLE IF NOT EXISTS "public"."mp_philosophy_arc_advancement" (
    "level" bigint,
    "title" "text",
    "description" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."mp_philosophy_arc_advancement" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mp_philosophy_arc_collective" (
    "phase" bigint,
    "title" "text",
    "description" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."mp_philosophy_arc_collective" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mp_philosophy_arc_responsibility" (
    "tier" bigint,
    "title" "text",
    "description" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."mp_philosophy_arc_responsibility" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mp_philosophy_arc_types" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "domain_code" "text" NOT NULL,
    "stages" "jsonb" NOT NULL,
    "typical_duration_days" integer,
    "default_graduation_threshold" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mp_philosophy_arc_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mp_philosophy_benchmark_framework" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "measurement_types" "jsonb" NOT NULL,
    "progression_rules" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mp_philosophy_benchmark_framework" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mp_philosophy_challenge_point" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text",
    "description" "text",
    "calculation_rules" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."mp_philosophy_challenge_point" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_age_bands" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text",
    "min_age" integer,
    "max_age" integer,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_age_bands" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_age_bands" IS 'Age bands for categorizing players by development stage';



CREATE TABLE IF NOT EXISTS "public"."mpbc_audit_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "table_name" "text",
    "record_id" "uuid",
    "action" "text",
    "new_values" "jsonb",
    "changed_by" "uuid",
    "changed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_benchmark_constraints" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "cla_benchmark_id" "uuid",
    "constraint_id" "uuid",
    "priority" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_benchmark_constraints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_block_player_assignment" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "block_id" "uuid",
    "player_id" "uuid",
    "special_role" "text",
    "constraints" "jsonb",
    "objectives" "text",
    "modifications" "text",
    "performance_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."mpbc_block_player_assignment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_cla_benchmarks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "cla_category_id" "uuid",
    "age_band_id" "uuid",
    "context" "text",
    "assessment_criteria" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "benchmark_category_id" "uuid",
    "advancement_level" "text"
);


ALTER TABLE "public"."mpbc_cla_benchmarks" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_cla_benchmarks" IS 'Competency Level Assessment benchmarks for player evaluation';



CREATE TABLE IF NOT EXISTS "public"."mpbc_cla_categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text",
    "description" "text",
    "learning_focus" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_cla_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_cla_categories" IS 'Categories for Competency Level Assessment framework';



CREATE TABLE IF NOT EXISTS "public"."mpbc_coach_template_preferences" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "coach_id" "uuid",
    "template_id" "uuid",
    "preference_score" integer,
    "usage_frequency" integer,
    "last_used" timestamp with time zone,
    "preferred_modifications" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_coach_template_preferences" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_coach_template_preferences" IS 'Coach preferences for development plan templates';



CREATE TABLE IF NOT EXISTS "public"."mpbc_constraint_manipulations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text",
    "description" "text",
    "constraint_type" "text",
    "cla_category_id" "uuid",
    "challenge_level" integer,
    "implementation_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_constraint_manipulations" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_constraint_manipulations" IS 'Constraint-based coaching manipulations for drills';



CREATE TABLE IF NOT EXISTS "public"."mpbc_constraint_type" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text",
    "description" "text",
    "category" "text",
    "application_method" "text",
    "example_implementations" "jsonb",
    "intensity_scalable" boolean,
    "attendance_adaptable" boolean,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_constraint_type" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_constraints_bank" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "constraint_name" "text",
    "constraint_text" "text",
    "skill_tag" "text",
    "offensive_or_defensive" "text",
    "constraint_type" "text",
    "example_contexts" "text",
    "confidence_score" numeric,
    "notes" "text",
    "prompt_keywords" "text",
    "ai_parsing_rules" "jsonb"
);


ALTER TABLE "public"."mpbc_constraints_bank" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_core_person_profile" (
    "person_id" "uuid" NOT NULL,
    "organization_id" "uuid",
    "height_cm" integer,
    "dominant_hand" "text",
    "playing_position" "text",
    "preferred_shot_zone" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "advancement_level" "text",
    "responsibility_tier" "text",
    "basketball_profile" "jsonb"
);


ALTER TABLE "public"."mpbc_core_person_profile" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_core_person_profile" IS 'Basketball-specific profile data for players';



COMMENT ON COLUMN "public"."mpbc_core_person_profile"."height_cm" IS 'Player height in centimeters';



COMMENT ON COLUMN "public"."mpbc_core_person_profile"."dominant_hand" IS 'Player''s dominant hand (left/right)';



COMMENT ON COLUMN "public"."mpbc_core_person_profile"."playing_position" IS 'Primary playing position on the court';



COMMENT ON COLUMN "public"."mpbc_core_person_profile"."preferred_shot_zone" IS 'Preferred area on the court for shooting';



CREATE TABLE IF NOT EXISTS "public"."mpbc_core_skill_mapping" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "mpbc_skill_id" "uuid",
    "core_skill_name" "text",
    "mapping_strength" integer,
    "mapping_context" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "core_skill_id" "uuid",
    "relationship_type" "text",
    "ai_confidence_score" integer,
    "development_priority" integer,
    "contextual_factors" "jsonb",
    "skill_transfer_coefficient" double precision,
    "optimal_age_range" "text",
    "prerequisite_skills" "text"[],
    "complementary_skills" "text"[]
);


ALTER TABLE "public"."mpbc_core_skill_mapping" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_core_skills" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "display_name" "text",
    "category" "text",
    "subcategory" "text",
    "description" "text",
    "synonyms" "text"[],
    "is_active" boolean DEFAULT true,
    "parent_skill_id" "uuid",
    "use_case" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "combo_code" "text"
);


ALTER TABLE "public"."mpbc_core_skills" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_core_skills" IS 'Core basketball skills taxonomy';



CREATE TABLE IF NOT EXISTS "public"."mpbc_cue_pack" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text",
    "skill_tag_id" "uuid",
    "phase_id" "uuid",
    "cue_type" "text",
    "cues" "text"[],
    "when_to_use" "text",
    "example_scenarios" "text",
    "effectiveness_rating" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_cue_pack" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_development_plan" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "player_id" "uuid",
    "group_id" "uuid",
    "season_id" "uuid",
    "initial_observation" "text",
    "objective" "text",
    "primary_pillar_id" "uuid",
    "secondary_pillar_id" "uuid",
    "focus_skills_id" "uuid",
    "target_outcomes" "text",
    "baseline_assessment" "text",
    "target_metrics" "jsonb",
    "timeline_weeks" integer,
    "priority_level" "text",
    "status" "text",
    "progress_percentage" integer,
    "last_review_date" timestamp with time zone,
    "next_review_date" timestamp with time zone,
    "progress_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "cla_primary_benchmark_id" "uuid",
    "cla_secondary_benchmark_id" "uuid",
    "cla_tertiary_benchmark_id" "uuid",
    "intelligence_development_goals" "jsonb",
    "context_assessment_enabled" boolean,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "archived_at" timestamp with time zone,
    "archived_by" "uuid",
    "target_end_date" timestamp with time zone,
    "actual_end_date" timestamp with time zone,
    "org_id" "uuid",
    "organization_id" "uuid",
    "version" "text",
    "overlay_schema" "text",
    "cycle_id" "uuid",
    "person_id" "uuid",
    "metadata" "jsonb",
    "old_id" "uuid",
    "migration_phase" "text",
    "needs_enhancement" boolean,
    "original_content" "text",
    "priority" integer
);


ALTER TABLE "public"."mpbc_development_plan" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_development_plan" IS 'Player development plans with objectives and tracking';



CREATE TABLE IF NOT EXISTS "public"."mpbc_development_plan_assessments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "development_plan_id" "uuid",
    "mp_core_benchmark_assessment_id" "uuid",
    "assessment_date" timestamp with time zone,
    "video_evidence_url" "text",
    "context_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_development_plan_assessments" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_development_plan_assessments" IS 'Assessments linked to player development plans';



CREATE TABLE IF NOT EXISTS "public"."mpbc_development_plan_progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "development_plan_id" "uuid",
    "skill_tag_id" "uuid",
    "assessment_date" timestamp with time zone,
    "previous_level" "text",
    "current_level" "text",
    "improvement_notes" "text",
    "evidence" "text",
    "next_steps" "text",
    "assessed_by" "uuid",
    "assessment_method" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_development_plan_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_drill_master" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text",
    "description" "text",
    "category" "text",
    "subcategory" "text",
    "setup_instructions" "text",
    "coaching_points" "text",
    "equipment_needed" "text",
    "space_requirements" "text",
    "min_players" integer,
    "max_players" integer,
    "optimal_players" integer,
    "duration_minutes" integer,
    "difficulty_level" "text",
    "age_appropriate" "text",
    "skill_tags" "text"[],
    "phase_tags" "text"[],
    "video_url" "text",
    "diagram_url" "text",
    "pdf_url" "text",
    "tags" "text"[],
    "verified" boolean,
    "usage_count" integer,
    "rating_avg" double precision,
    "active" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."mpbc_drill_master" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_drill_master" IS 'Master list of basketball drills';



CREATE TABLE IF NOT EXISTS "public"."mpbc_drill_org" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "master_drill_id" "uuid",
    "name" "text",
    "description" "text",
    "customizations" "jsonb",
    "private" boolean,
    "active" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."mpbc_drill_org" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_drill_org" IS 'Organization-specific drill configurations';



CREATE TABLE IF NOT EXISTS "public"."mpbc_drill_phase_tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "drill_id" "uuid",
    "phase_id" "uuid",
    "relevance_level" integer
);


ALTER TABLE "public"."mpbc_drill_phase_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_drill_skill_tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "drill_id" "uuid",
    "skill_tag_id" "uuid",
    "emphasis_level" integer
);


ALTER TABLE "public"."mpbc_drill_skill_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_goal_tracking" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "person_id" "uuid",
    "development_plan_id" "uuid",
    "group_id" "uuid",
    "season_id" "uuid",
    "goal_type" "text",
    "title" "text",
    "description" "text",
    "target_metric" "text",
    "target_value" "text",
    "current_value" "text",
    "deadline" timestamp with time zone,
    "priority" "text",
    "status" "text",
    "progress_notes" "text",
    "last_updated" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."mpbc_goal_tracking" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_goal_tracking" IS 'Player goal tracking and progress metrics';



CREATE TABLE IF NOT EXISTS "public"."mpbc_group" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "mp_core_group_id" "uuid",
    "division" "text",
    "conference" "text",
    "playing_style" "text",
    "team_philosophy" "text",
    "season_record" "text",
    "team_statistics" "jsonb",
    "home_court" "text",
    "practice_facility" "text",
    "equipment_inventory" "jsonb",
    "travel_requirements" "text",
    "collective_skill_level" "text",
    "team_chemistry_rating" integer,
    "leadership_structure" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "name" "text",
    "group_type" "text",
    "lead_person_id" "uuid",
    "program" "text",
    "level_category" "text",
    "description" "text",
    "max_capacity" integer,
    "schedule" "jsonb",
    "metadata" "jsonb",
    "active" boolean,
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."mpbc_group" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_group" IS 'Basketball-specific group/team data extending mp_core_group';



CREATE TABLE IF NOT EXISTS "public"."mpbc_group_metadata" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "mp_core_group_id" "uuid",
    "collective_growth_phase" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_group_metadata" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_group_metadata" IS 'Additional metadata for basketball teams/groups';



CREATE TABLE IF NOT EXISTS "public"."mpbc_group_profile" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "mpbc_group_id" "uuid",
    "collective_advancement_level" "text",
    "collective_responsibility_tier" "text",
    "collective_growth_phase" "text",
    "offensive_rating" integer,
    "defensive_rating" integer,
    "pace_of_play" integer,
    "team_efficiency" integer,
    "strengths" "text"[],
    "areas_for_improvement" "text"[],
    "team_goals" "text",
    "problem_solving_effectiveness" integer,
    "adaptability_rating" integer,
    "communication_effectiveness" integer,
    "performance_trends" "jsonb",
    "milestone_achievements" "text"[],
    "last_team_assessment_date" timestamp with time zone,
    "assessment_notes" "text",
    "next_development_targets" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_group_profile" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_group_profile" IS 'Profile information for basketball teams/groups';



CREATE TABLE IF NOT EXISTS "public"."mpbc_individual_challenge_points" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "mp_core_person_id" "uuid",
    "cla_category_id" "uuid",
    "current_challenge_level" integer,
    "optimal_challenge_level" integer,
    "success_rate" double precision,
    "last_calculated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_individual_challenge_points" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_individual_challenge_points" IS 'Individual player challenge points';



CREATE TABLE IF NOT EXISTS "public"."mpbc_message_threads" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text",
    "type" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "mpbc_message_threads_type_check" CHECK (("type" = ANY (ARRAY['direct'::"text", 'group'::"text", 'team'::"text", 'announcement'::"text"])))
);


ALTER TABLE "public"."mpbc_message_threads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "thread_id" "uuid",
    "sender_id" "uuid",
    "content" "text",
    "attachments" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_observations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "player_id" "uuid",
    "observer_id" "uuid",
    "skill_tags" "text"[],
    "cla_category" "text",
    "context" "text",
    "observation_text" "text",
    "performance_rating" integer,
    "basketball_specific_metrics" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "development_plan_id" "uuid",
    "archived_at" timestamp with time zone,
    "archived_by" "uuid",
    "org_id" "uuid",
    "person_id" "uuid",
    "group_id" "uuid",
    "cycle_id" "uuid",
    "organization_id" "uuid",
    "tags" "text"[],
    "observation_date" timestamp with time zone,
    "updated_by" "uuid"
);


ALTER TABLE "public"."mpbc_observations" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_observations" IS 'Observations of players linked to development plans';



CREATE TABLE IF NOT EXISTS "public"."mpbc_organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "type" "text",
    "description" "text",
    "logo_url" "text",
    "contact_info" "jsonb",
    "settings" "jsonb",
    "subscription_tier" "text",
    "overlay_version" "text",
    "active" boolean,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_organizations" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_organizations" IS 'Basketball-specific organization data';



CREATE TABLE IF NOT EXISTS "public"."mpbc_outcome" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text",
    "description" "text",
    "theme_id" "uuid",
    "phase_id" "uuid",
    "measurement_type" "text",
    "success_criteria" "text",
    "active" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_outcome" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_outcome" IS 'Outcome definitions for development plans';



CREATE TABLE IF NOT EXISTS "public"."mpbc_performance_indicators" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "cla_benchmark_id" "uuid",
    "level" "text",
    "description" "text",
    "mp_core_benchmark_standard_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_performance_indicators" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_performance_indicators" IS 'Key performance indicators for player evaluation';



CREATE TABLE IF NOT EXISTS "public"."mpbc_performance_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "metric_type" "text",
    "metric_value" double precision,
    "metric_date" timestamp with time zone,
    "season_id" "uuid",
    "calculation_method" "text",
    "data_points" integer,
    "confidence_score" double precision,
    "notes" "text",
    "calculated_at" timestamp with time zone
);


ALTER TABLE "public"."mpbc_performance_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_person" (
    "id" "uuid" NOT NULL,
    "mp_core_person_id" "uuid" NOT NULL,
    "basketball_advancement_level" "text",
    "basketball_responsibility_tier" "text",
    "basketball_collective_phase" "text",
    "position" "text",
    "jersey_number" "text",
    "height" "text",
    "skill_ratings" "jsonb",
    "strengths" "text"[],
    "areas_for_improvement" "text"[],
    "previous_advancement_level" "text",
    "last_advancement_date" timestamp with time zone,
    "advancement_evidence" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "metadata" "jsonb",
    "first_name" "text",
    "last_name" "text",
    "email" "text",
    "phone" "text",
    "notes" "text",
    "person_type" "text",
    "organization_id" "uuid",
    "active" boolean,
    "date_of_birth" timestamp with time zone,
    "emergency_contact" "jsonb",
    "profile_image_url" "text",
    "medical_info" "jsonb",
    "parent_guardian_info" "jsonb",
    "created_by" "uuid",
    "updated_by" "uuid",
    "basketball_profile" "jsonb",
    "business_profile" "jsonb",
    "education_profile" "jsonb",
    "auth_id" "uuid"
);


ALTER TABLE "public"."mpbc_person" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_person" IS 'Knowledge database person table with basketball-specific profile data';



CREATE TABLE IF NOT EXISTS "public"."mpbc_person_group" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "person_id" "uuid",
    "group_id" "uuid",
    "role" "text",
    "organization_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "cycle_id" "uuid",
    "position" "text",
    "identifier" "text",
    "status" "text",
    "metadata" "jsonb",
    "joined_at" timestamp with time zone,
    "left_at" timestamp with time zone,
    "created_by" "uuid"
);


ALTER TABLE "public"."mpbc_person_group" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_person_group" IS 'Basketball-specific person-group membership data';



CREATE TABLE IF NOT EXISTS "public"."mpbc_person_metadata" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "mp_core_person_id" "uuid",
    "advancement_level" "text",
    "responsibility_tier" "text",
    "basketball_profile" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_person_metadata" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_person_metadata" IS 'Additional metadata for basketball players';



CREATE TABLE IF NOT EXISTS "public"."mpbc_person_profile" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "mp_core_person_id" "uuid",
    "age_band_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "advancement_level" "text",
    "responsibility_tier" "text",
    "basketball_profile" "jsonb"
);


ALTER TABLE "public"."mpbc_person_profile" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_person_profile" IS 'Profile information for basketball players';



CREATE TABLE IF NOT EXISTS "public"."mpbc_person_relationships" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "person_id" "uuid",
    "related_person_id" "uuid",
    "relationship_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_person_relationships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_person_role" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "person_id" "uuid",
    "organization_id" "uuid",
    "role" "text" NOT NULL,
    "permissions" "text"[] DEFAULT '{}'::"text"[],
    "scope_type" "text",
    "scope_ids" "uuid"[],
    "active" boolean DEFAULT true,
    "started_at" timestamp with time zone DEFAULT "now"(),
    "ended_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."mpbc_person_role" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_phase" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text",
    "description" "text",
    "pillar_id" "uuid",
    "key_concepts" "text",
    "order_index" integer,
    "active" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_phase" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_phase" IS 'Development phases for basketball players';



CREATE TABLE IF NOT EXISTS "public"."mpbc_pillar" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text",
    "description" "text",
    "focus_area" "text",
    "key_principles" "text",
    "desired_outcomes" "text",
    "order_index" integer,
    "active" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_pillar" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_pillar" IS 'Fundamental pillars of basketball development';



CREATE TABLE IF NOT EXISTS "public"."mpbc_player_skill_challenge" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "development_plan_id" "uuid",
    "skill_tag_id" "uuid",
    "challenge_title" "text",
    "description" "text",
    "success_criteria" "text",
    "practice_frequency" "text",
    "deadline" timestamp with time zone,
    "priority" "text",
    "difficulty" "text",
    "status" "text",
    "progress_percentage" integer,
    "coach_notes" "text",
    "player_notes" "text",
    "resources" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "player_id" "uuid"
);


ALTER TABLE "public"."mpbc_player_skill_challenge" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_player_skill_challenge" IS 'Skill challenges for player development';



CREATE TABLE IF NOT EXISTS "public"."mpbc_practice_block" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid",
    "master_drill_id" "uuid",
    "org_drill_id" "uuid",
    "block_name" "text",
    "description" "text",
    "phase_id" "uuid",
    "theme_id" "uuid",
    "objective" "text",
    "duration_minutes" integer,
    "order_index" integer,
    "format" "text",
    "constraints" "jsonb",
    "coaching_emphasis" "text",
    "success_criteria" "text",
    "modifications" "text",
    "equipment_needed" "text",
    "space_setup" "text",
    "player_groupings" "jsonb",
    "notes" "text",
    "completed" boolean,
    "effectiveness_rating" integer,
    "active" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "cla_intelligence_targets" "jsonb",
    "context_complexity_level" integer,
    "assessment_opportunities" "text"
);


ALTER TABLE "public"."mpbc_practice_block" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_practice_block" IS 'Practice blocks for session planning';



CREATE TABLE IF NOT EXISTS "public"."mpbc_practice_block_cla_constraints" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "practice_block_id" "uuid",
    "constraint_manipulation_id" "uuid",
    "application_notes" "text",
    "effectiveness_rating" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_practice_block_cla_constraints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_practice_session" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid",
    "season_id" "uuid",
    "session_number" integer,
    "date" timestamp with time zone,
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "location" "text",
    "facility_info" "text",
    "primary_theme_id" "uuid",
    "secondary_theme_id" "uuid",
    "session_objective" "text",
    "pre_practice_notes" "text",
    "post_practice_notes" "text",
    "coach_reflection" "text",
    "intensity_level" integer,
    "status" "text",
    "expected_attendance" integer,
    "actual_attendance" integer,
    "weather_conditions" "text",
    "equipment_issues" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."mpbc_practice_session" OWNER TO "postgres";


COMMENT ON TABLE "public"."mpbc_practice_session" IS 'Practice session planning and management';



CREATE TABLE IF NOT EXISTS "public"."mpbc_practice_templates_enhanced" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "template_id" "text",
    "base_practice_number" integer,
    "attendance_min" integer,
    "attendance_max" integer,
    "intensity_level" integer,
    "focus_area" "text",
    "template_blocks" "jsonb",
    "estimated_duration" integer,
    "mpbc_alignment" "jsonb",
    "constraint_density" double precision,
    "attendance_adaptations" "jsonb",
    "variability_factors" "jsonb",
    "cla_enhanced" boolean,
    "effectiveness_score" double precision,
    "usage_count" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_practice_templates_enhanced" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_practice_theme" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "description" "text",
    "category" "text",
    "subcategory" "text",
    "phase_id" "text",
    "pillar_id" "text",
    "combo_code" bigint,
    "synonyms" "jsonb",
    "use_case" "text",
    "verified" boolean,
    "active" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "suggested_by" "text",
    "source_uid" "text"
);


ALTER TABLE "public"."mpbc_practice_theme" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_prompt_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "prompt_name" "text" NOT NULL,
    "use_case" "text" NOT NULL,
    "prompt_template" "text" NOT NULL,
    "system_instructions" "text",
    "example_inputs" "jsonb",
    "example_outputs" "jsonb",
    "model_parameters" "jsonb",
    "version" "text" DEFAULT 'v1.0'::"text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_prompt_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_season" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "year" integer NOT NULL,
    "term" "text",
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "description" "text",
    "goals" "text"[],
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "season_check" CHECK (("end_date" > "start_date")),
    CONSTRAINT "season_term_check" CHECK (("term" = ANY (ARRAY['fall'::"text", 'winter'::"text", 'spring'::"text", 'summer'::"text", 'annual'::"text"])))
);


ALTER TABLE "public"."mpbc_season" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_session_participation" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "player_id" "uuid" NOT NULL,
    "blocks_participated" "uuid"[],
    "leadership_displayed" "text"[],
    "effort_level" integer,
    "attitude_rating" integer,
    "skill_demonstration" "text"[],
    "areas_struggled" "text"[],
    "coach_feedback" "text",
    "player_self_assessment" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "recorded_by" "uuid",
    CONSTRAINT "session_participation_attitude_rating_check" CHECK ((("attitude_rating" >= 1) AND ("attitude_rating" <= 5))),
    CONSTRAINT "session_participation_effort_level_check" CHECK ((("effort_level" >= 1) AND ("effort_level" <= 5)))
);


ALTER TABLE "public"."mpbc_session_participation" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_signal_type" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "signal_name" "text" NOT NULL,
    "description" "text",
    "category" "text",
    "trigger_conditions" "jsonb",
    "recommended_actions" "text"[],
    "priority_level" integer DEFAULT 3,
    "auto_generate" boolean DEFAULT false,
    "prompt_template" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_signal_type" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_skill_prerequisites" (
    "skill_id" "text",
    "prerequisite_skill_id" "text",
    "required" boolean,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."mpbc_skill_prerequisites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_skill_tag" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "description" "text",
    "category" "text",
    "difficulty_level" bigint,
    "prerequisites" "text",
    "pillar_id" "text",
    "parent_skill_id" "text",
    "progression_order" bigint,
    "active" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "cla_category_mapping" "text",
    "intelligence_focus" "text",
    "context_requirements" "text"
);


ALTER TABLE "public"."mpbc_skill_tag" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_template_usage_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "template_id" "uuid",
    "session_id" "uuid",
    "organization_id" "uuid",
    "coach_id" "uuid",
    "attendance_actual" integer,
    "effectiveness_rating" integer,
    "modifications_made" "jsonb",
    "coach_feedback" "text",
    "would_use_again" boolean,
    "used_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_template_usage_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_thread_participants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "thread_id" "uuid",
    "user_id" "uuid",
    "role" "text",
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_thread_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mpbc_version_config" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "version" "text" NOT NULL,
    "schema_version" "text" NOT NULL,
    "prompt_library" "jsonb",
    "constraint_definitions" "jsonb",
    "ai_model_config" "jsonb",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mpbc_version_config" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."session_participation_summary" WITH ("security_invoker"='on') AS
 SELECT "s"."id" AS "session_id",
    "s"."date",
    "s"."session_type",
    "g"."name" AS "group_name",
    "count"("pl"."id") AS "total_tracked",
    "count"(
        CASE
            WHEN ("pl"."status" = 'present'::"text") THEN 1
            ELSE NULL::integer
        END) AS "present_count",
    "count"(
        CASE
            WHEN ("pl"."status" = 'absent'::"text") THEN 1
            ELSE NULL::integer
        END) AS "absent_count",
    "count"(
        CASE
            WHEN ("pl"."status" = 'late'::"text") THEN 1
            ELSE NULL::integer
        END) AS "late_count",
    "round"(((("count"(
        CASE
            WHEN ("pl"."status" = 'present'::"text") THEN 1
            ELSE NULL::integer
        END))::numeric / (NULLIF("count"("pl"."id"), 0))::numeric) * (100)::numeric), 2) AS "attendance_percentage"
   FROM (("public"."infrastructure_sessions" "s"
     JOIN "public"."mp_core_group" "g" ON (("g"."id" = "s"."group_id")))
     LEFT JOIN "public"."infrastructure_participation_log" "pl" ON (("pl"."session_id" = "s"."id")))
  GROUP BY "s"."id", "s"."date", "s"."session_type", "g"."name";


ALTER TABLE "public"."session_participation_summary" OWNER TO "supabase_read_only_user";


CREATE OR REPLACE VIEW "public"."v_mp_core_group_membership" AS
 SELECT "mp_core_person_group"."id",
    "mp_core_person_group"."group_id",
    "mp_core_person_group"."person_id",
    "mp_core_person_group"."role",
    "mp_core_person_group"."created_at",
    "mp_core_person_group"."updated_at"
   FROM "public"."mp_core_person_group";


ALTER TABLE "public"."v_mp_core_group_membership" OWNER TO "postgres";


ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."infrastructure_dashboard_config"
    ADD CONSTRAINT "dashboard_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."infrastructure_file_storage"
    ADD CONSTRAINT "file_storage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."infrastructure_activity_logs"
    ADD CONSTRAINT "infrastructure_activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."infrastructure_invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."infrastructure_invites"
    ADD CONSTRAINT "invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."infrastructure_memberships"
    ADD CONSTRAINT "memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_core_actions"
    ADD CONSTRAINT "mp_core_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_core_intentions"
    ADD CONSTRAINT "mp_core_intentions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_core_person"
    ADD CONSTRAINT "mp_core_person_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_core_person"
    ADD CONSTRAINT "mp_core_person_stripe_customer_id_key" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."mp_core_person"
    ADD CONSTRAINT "mp_core_person_stripe_customer_id_unique" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."mp_core_person"
    ADD CONSTRAINT "mp_core_person_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."mp_core_person"
    ADD CONSTRAINT "mp_core_person_stripe_subscription_id_unique" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."mp_core_reflections"
    ADD CONSTRAINT "mp_core_reflections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_core_group"
    ADD CONSTRAINT "mp_core_team_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_philosophy_arc_advancement"
    ADD CONSTRAINT "mp_philosophy_arc_advancement_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_philosophy_arc_collective"
    ADD CONSTRAINT "mp_philosophy_arc_collective_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_philosophy_arc_responsibility"
    ADD CONSTRAINT "mp_philosophy_arc_responsibility_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_philosophy_arc_types"
    ADD CONSTRAINT "mp_philosophy_arc_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."mp_philosophy_arc_types"
    ADD CONSTRAINT "mp_philosophy_arc_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_philosophy_benchmark_framework"
    ADD CONSTRAINT "mp_philosophy_benchmark_framework_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."mp_philosophy_benchmark_framework"
    ADD CONSTRAINT "mp_philosophy_benchmark_framework_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_philosophy_challenge_point"
    ADD CONSTRAINT "mp_philosophy_challenge_point_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_age_bands"
    ADD CONSTRAINT "mpbc_age_bands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_audit_log"
    ADD CONSTRAINT "mpbc_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_benchmark_constraints"
    ADD CONSTRAINT "mpbc_benchmark_constraints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_block_player_assignment"
    ADD CONSTRAINT "mpbc_block_player_assignment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_cla_benchmarks"
    ADD CONSTRAINT "mpbc_cla_benchmarks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_cla_categories"
    ADD CONSTRAINT "mpbc_cla_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_coach_template_preferences"
    ADD CONSTRAINT "mpbc_coach_template_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_constraint_manipulations"
    ADD CONSTRAINT "mpbc_constraint_manipulations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_constraint_type"
    ADD CONSTRAINT "mpbc_constraint_type_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_constraints_bank"
    ADD CONSTRAINT "mpbc_constraints_bank_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_core_person_profile"
    ADD CONSTRAINT "mpbc_core_person_profile_pkey" PRIMARY KEY ("person_id");



ALTER TABLE ONLY "public"."mpbc_core_skill_mapping"
    ADD CONSTRAINT "mpbc_core_skill_mapping_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_core_skills"
    ADD CONSTRAINT "mpbc_core_skills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_cue_pack"
    ADD CONSTRAINT "mpbc_cue_pack_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_development_plan_assessments"
    ADD CONSTRAINT "mpbc_development_plan_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_development_plan"
    ADD CONSTRAINT "mpbc_development_plan_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_development_plan_progress"
    ADD CONSTRAINT "mpbc_development_plan_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_drill_master"
    ADD CONSTRAINT "mpbc_drill_master_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_drill_org"
    ADD CONSTRAINT "mpbc_drill_org_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_drill_phase_tags"
    ADD CONSTRAINT "mpbc_drill_phase_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_drill_skill_tags"
    ADD CONSTRAINT "mpbc_drill_skill_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_goal_tracking"
    ADD CONSTRAINT "mpbc_goal_tracking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_group_metadata"
    ADD CONSTRAINT "mpbc_group_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_group"
    ADD CONSTRAINT "mpbc_group_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_group_profile"
    ADD CONSTRAINT "mpbc_group_profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_individual_challenge_points"
    ADD CONSTRAINT "mpbc_individual_challenge_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_message_threads"
    ADD CONSTRAINT "mpbc_message_threads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_messages"
    ADD CONSTRAINT "mpbc_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_observations"
    ADD CONSTRAINT "mpbc_observations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_organizations"
    ADD CONSTRAINT "mpbc_organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_outcome"
    ADD CONSTRAINT "mpbc_outcome_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_performance_indicators"
    ADD CONSTRAINT "mpbc_performance_indicators_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_performance_metrics"
    ADD CONSTRAINT "mpbc_performance_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_person_group"
    ADD CONSTRAINT "mpbc_person_group_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_person_metadata"
    ADD CONSTRAINT "mpbc_person_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_person"
    ADD CONSTRAINT "mpbc_person_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_person_profile"
    ADD CONSTRAINT "mpbc_person_profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_person_relationships"
    ADD CONSTRAINT "mpbc_person_relationships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_person_role"
    ADD CONSTRAINT "mpbc_person_role_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_phase"
    ADD CONSTRAINT "mpbc_phase_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_pillar"
    ADD CONSTRAINT "mpbc_pillar_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_player_skill_challenge"
    ADD CONSTRAINT "mpbc_player_skill_challenge_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_practice_block_cla_constraints"
    ADD CONSTRAINT "mpbc_practice_block_cla_constraints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_practice_block"
    ADD CONSTRAINT "mpbc_practice_block_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_practice_session"
    ADD CONSTRAINT "mpbc_practice_session_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_practice_templates_enhanced"
    ADD CONSTRAINT "mpbc_practice_templates_enhanced_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_practice_theme"
    ADD CONSTRAINT "mpbc_practice_theme_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_prompt_templates"
    ADD CONSTRAINT "mpbc_prompt_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_signal_type"
    ADD CONSTRAINT "mpbc_signal_type_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_skill_prerequisites"
    ADD CONSTRAINT "mpbc_skill_prerequisites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_skill_tag"
    ADD CONSTRAINT "mpbc_skill_tag_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_thread_participants"
    ADD CONSTRAINT "mpbc_thread_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_version_config"
    ADD CONSTRAINT "mpbc_version_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."infrastructure_notification_queue"
    ADD CONSTRAINT "notification_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_core_organizations"
    ADD CONSTRAINT "orgs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."infrastructure_participation_log"
    ADD CONSTRAINT "participation_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_core_person_group"
    ADD CONSTRAINT "person_group_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mp_core_person_role"
    ADD CONSTRAINT "person_role_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."infrastructure_program_cycle"
    ADD CONSTRAINT "program_cycle_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_season"
    ADD CONSTRAINT "season_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_session_participation"
    ADD CONSTRAINT "session_participation_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_session_participation"
    ADD CONSTRAINT "session_participation_session_id_player_id_key" UNIQUE ("session_id", "player_id");



ALTER TABLE ONLY "public"."infrastructure_sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."infrastructure_system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_template_usage_log"
    ADD CONSTRAINT "template_usage_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mpbc_season"
    ADD CONSTRAINT "unique_active_season" UNIQUE ("organization_id", "active") DEFERRABLE INITIALLY DEFERRED;



CREATE INDEX "idx_dashboard_config_organization_id" ON "public"."infrastructure_dashboard_config" USING "btree" ("organization_id");



CREATE INDEX "idx_dashboard_config_person_id" ON "public"."infrastructure_dashboard_config" USING "btree" ("person_id");



CREATE INDEX "idx_file_storage_entity_id" ON "public"."infrastructure_file_storage" USING "btree" ("entity_id");



CREATE INDEX "idx_file_storage_organization_id" ON "public"."infrastructure_file_storage" USING "btree" ("organization_id");



CREATE INDEX "idx_mp_core_person_auth_uid" ON "public"."mp_core_person" USING "btree" ("auth_uid");



CREATE INDEX "idx_mp_core_person_group_group_id" ON "public"."mp_core_person_group" USING "btree" ("group_id");



CREATE INDEX "idx_mp_core_person_group_person_id" ON "public"."mp_core_person_group" USING "btree" ("person_id");



CREATE INDEX "idx_mp_core_person_organization_id" ON "public"."mp_core_person" USING "btree" ("organization_id");



CREATE INDEX "idx_mpbc_core_person_profile_org_id" ON "public"."mpbc_core_person_profile" USING "btree" ("organization_id");



CREATE INDEX "idx_mpbc_development_plan_archived_at" ON "public"."mpbc_development_plan" USING "btree" ("archived_at");



CREATE INDEX "idx_mpbc_development_plan_organization_id" ON "public"."mpbc_development_plan" USING "btree" ("organization_id");



CREATE INDEX "idx_mpbc_development_plan_person_id" ON "public"."mpbc_development_plan" USING "btree" ("person_id");



CREATE INDEX "idx_mpbc_group_mp_core_group_id" ON "public"."mpbc_group" USING "btree" ("mp_core_group_id");



CREATE INDEX "idx_mpbc_observations_archived_at" ON "public"."mpbc_observations" USING "btree" ("archived_at");



CREATE INDEX "idx_mpbc_observations_development_plan_id" ON "public"."mpbc_observations" USING "btree" ("development_plan_id");



CREATE INDEX "idx_mpbc_observations_organization_id" ON "public"."mpbc_observations" USING "btree" ("organization_id");



CREATE INDEX "idx_mpbc_observations_person_id" ON "public"."mpbc_observations" USING "btree" ("person_id");



CREATE INDEX "idx_mpbc_person_group_group_id" ON "public"."mpbc_person_group" USING "btree" ("group_id");



CREATE INDEX "idx_mpbc_person_group_person_id" ON "public"."mpbc_person_group" USING "btree" ("person_id");



CREATE INDEX "idx_mpbc_person_mp_core_person_id" ON "public"."mpbc_person" USING "btree" ("mp_core_person_id");



CREATE INDEX "idx_mpbc_person_organization_id" ON "public"."mpbc_person" USING "btree" ("organization_id");



CREATE INDEX "idx_notification_queue_organization_id" ON "public"."infrastructure_notification_queue" USING "btree" ("organization_id");



CREATE INDEX "idx_notification_queue_recipient_id" ON "public"."infrastructure_notification_queue" USING "btree" ("recipient_id");



CREATE INDEX "idx_orgs_id" ON "public"."mp_core_organizations" USING "btree" ("id");



CREATE INDEX "idx_participation_log_organization_id" ON "public"."infrastructure_participation_log" USING "btree" ("organization_id");



CREATE INDEX "idx_participation_log_person_id" ON "public"."infrastructure_participation_log" USING "btree" ("person_id");



CREATE INDEX "idx_participation_log_session_id" ON "public"."infrastructure_participation_log" USING "btree" ("session_id");



CREATE INDEX "idx_person_group_cycle_id" ON "public"."mp_core_person_group" USING "btree" ("cycle_id");



CREATE INDEX "idx_person_group_group_id" ON "public"."mp_core_person_group" USING "btree" ("group_id");



CREATE INDEX "idx_person_group_person_id" ON "public"."mp_core_person_group" USING "btree" ("person_id");



CREATE INDEX "idx_person_role_organization_id" ON "public"."mp_core_person_role" USING "btree" ("organization_id");



CREATE INDEX "idx_person_role_person_id" ON "public"."mp_core_person_role" USING "btree" ("person_id");



CREATE INDEX "idx_season_dates" ON "public"."mpbc_season" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_season_organization_active" ON "public"."mpbc_season" USING "btree" ("organization_id", "active");



CREATE INDEX "idx_sessions_cycle_id" ON "public"."infrastructure_sessions" USING "btree" ("cycle_id");



CREATE INDEX "idx_sessions_group_id" ON "public"."infrastructure_sessions" USING "btree" ("group_id");



CREATE INDEX "idx_sessions_organization_id" ON "public"."infrastructure_sessions" USING "btree" ("organization_id");



CREATE INDEX "idx_system_settings_organization_id" ON "public"."infrastructure_system_settings" USING "btree" ("organization_id");



CREATE INDEX "mpbc_person_role_organization_id_idx" ON "public"."mpbc_person_role" USING "btree" ("organization_id");



CREATE INDEX "mpbc_person_role_person_id_idx" ON "public"."mpbc_person_role" USING "btree" ("person_id");



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_age_bands" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_cla_benchmarks" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_cla_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_coach_template_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_constraint_manipulations" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_core_skills" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_development_plan" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_development_plan_assessments" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_drill_master" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_drill_org" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_goal_tracking" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_group" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_group_metadata" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_group_profile" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_individual_challenge_points" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_observations" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_outcome" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_performance_indicators" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_person" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_person_metadata" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_person_profile" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_phase" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_pillar" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_player_skill_challenge" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_practice_block" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."mpbc_practice_session" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_update_dashboard_config_updated_at" BEFORE UPDATE ON "public"."infrastructure_dashboard_config" FOR EACH ROW EXECUTE FUNCTION "public"."update_dashboard_config_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_organization_updated_at" BEFORE UPDATE ON "public"."mp_core_organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_organization_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_sessions_updated_at" BEFORE UPDATE ON "public"."infrastructure_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_sessions_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_system_settings_updated_at" BEFORE UPDATE ON "public"."infrastructure_system_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_system_settings_updated_at"();



CREATE OR REPLACE TRIGGER "update_season_updated_at" BEFORE UPDATE ON "public"."mpbc_season" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."infrastructure_dashboard_config"
    ADD CONSTRAINT "dashboard_config_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."infrastructure_file_storage"
    ADD CONSTRAINT "file_storage_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."mp_core_actions"
    ADD CONSTRAINT "fk_actions_group" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id");



ALTER TABLE ONLY "public"."mp_core_actions"
    ADD CONSTRAINT "fk_actions_intention" FOREIGN KEY ("intention_id") REFERENCES "public"."mp_core_intentions"("id");



ALTER TABLE ONLY "public"."mp_core_actions"
    ADD CONSTRAINT "fk_actions_person" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_group"
    ADD CONSTRAINT "fk_group_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_group"
    ADD CONSTRAINT "fk_group_lead_person" FOREIGN KEY ("lead_person_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_group"
    ADD CONSTRAINT "fk_group_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."mp_core_group"
    ADD CONSTRAINT "fk_group_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_intentions"
    ADD CONSTRAINT "fk_intentions_group" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id");



ALTER TABLE ONLY "public"."mp_core_intentions"
    ADD CONSTRAINT "fk_intentions_person" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mpbc_development_plan"
    ADD CONSTRAINT "fk_mpbc_development_plan_person" FOREIGN KEY ("person_id") REFERENCES "public"."mpbc_person"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."mpbc_group"
    ADD CONSTRAINT "fk_mpbc_group_mp_core_group" FOREIGN KEY ("mp_core_group_id") REFERENCES "public"."mp_core_group"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mpbc_observations"
    ADD CONSTRAINT "fk_mpbc_observations_development_plan" FOREIGN KEY ("development_plan_id") REFERENCES "public"."mpbc_development_plan"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."mpbc_observations"
    ADD CONSTRAINT "fk_mpbc_observations_person" FOREIGN KEY ("person_id") REFERENCES "public"."mpbc_person"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."mpbc_person"
    ADD CONSTRAINT "fk_mpbc_person_mp_core_person" FOREIGN KEY ("mp_core_person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mp_core_person"
    ADD CONSTRAINT "fk_person_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_person_group"
    ADD CONSTRAINT "fk_person_group_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_person_group"
    ADD CONSTRAINT "fk_person_group_group" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id");



ALTER TABLE ONLY "public"."mp_core_person_group"
    ADD CONSTRAINT "fk_person_group_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."mp_core_person_group"
    ADD CONSTRAINT "fk_person_group_payer" FOREIGN KEY ("payer_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_person_group"
    ADD CONSTRAINT "fk_person_group_person" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_person"
    ADD CONSTRAINT "fk_person_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."mp_core_person_role"
    ADD CONSTRAINT "fk_person_role_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_person_role"
    ADD CONSTRAINT "fk_person_role_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."mp_core_person_role"
    ADD CONSTRAINT "fk_person_role_person" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_person"
    ADD CONSTRAINT "fk_person_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_reflections"
    ADD CONSTRAINT "fk_reflections_action" FOREIGN KEY ("action_id") REFERENCES "public"."mp_core_actions"("id");



ALTER TABLE ONLY "public"."mp_core_reflections"
    ADD CONSTRAINT "fk_reflections_group" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id");



ALTER TABLE ONLY "public"."mp_core_reflections"
    ADD CONSTRAINT "fk_reflections_intention" FOREIGN KEY ("intention_id") REFERENCES "public"."mp_core_intentions"("id");



ALTER TABLE ONLY "public"."mp_core_reflections"
    ADD CONSTRAINT "fk_reflections_person" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."infrastructure_activity_logs"
    ADD CONSTRAINT "infrastructure_activity_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."infrastructure_activity_logs"
    ADD CONSTRAINT "infrastructure_activity_logs_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."infrastructure_invitations"
    ADD CONSTRAINT "infrastructure_invitations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."mp_core_group"("id");



ALTER TABLE ONLY "public"."infrastructure_sessions"
    ADD CONSTRAINT "infrastructure_sessions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id");



ALTER TABLE ONLY "public"."infrastructure_invites"
    ADD CONSTRAINT "invites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."infrastructure_memberships"
    ADD CONSTRAINT "memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."infrastructure_memberships"
    ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mp_core_actions"
    ADD CONSTRAINT "mp_core_actions_intention_id_fkey" FOREIGN KEY ("intention_id") REFERENCES "public"."mp_core_intentions"("id");



ALTER TABLE ONLY "public"."mp_core_actions"
    ADD CONSTRAINT "mp_core_actions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mp_core_actions"
    ADD CONSTRAINT "mp_core_actions_team_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id");



ALTER TABLE ONLY "public"."mp_core_intentions"
    ADD CONSTRAINT "mp_core_intentions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mp_core_intentions"
    ADD CONSTRAINT "mp_core_intentions_team_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id");



ALTER TABLE ONLY "public"."mp_core_person"
    ADD CONSTRAINT "mp_core_person_auth_uid_fkey" FOREIGN KEY ("auth_uid") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mp_core_person_group"
    ADD CONSTRAINT "mp_core_person_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id");



ALTER TABLE ONLY "public"."mp_core_person_group"
    ADD CONSTRAINT "mp_core_person_group_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_person_group"
    ADD CONSTRAINT "mp_core_person_group_payer_id_mp_core_person_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_person_group"
    ADD CONSTRAINT "mp_core_person_group_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mp_core_reflections"
    ADD CONSTRAINT "mp_core_reflections_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "public"."mp_core_actions"("id");



ALTER TABLE ONLY "public"."mp_core_reflections"
    ADD CONSTRAINT "mp_core_reflections_intention_id_fkey" FOREIGN KEY ("intention_id") REFERENCES "public"."mp_core_intentions"("id");



ALTER TABLE ONLY "public"."mp_core_reflections"
    ADD CONSTRAINT "mp_core_reflections_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mp_core_reflections"
    ADD CONSTRAINT "mp_core_reflections_team_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id");



ALTER TABLE ONLY "public"."mp_core_person_role"
    ADD CONSTRAINT "mp_person_role_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mpbc_core_person_profile"
    ADD CONSTRAINT "mpbc_core_person_profile_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."mpbc_core_person_profile"
    ADD CONSTRAINT "mpbc_core_person_profile_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mpbc_development_plan_assessments"
    ADD CONSTRAINT "mpbc_development_plan_assessments_development_plan_id_fkey" FOREIGN KEY ("development_plan_id") REFERENCES "public"."mpbc_development_plan"("id");



ALTER TABLE ONLY "public"."mpbc_development_plan"
    ADD CONSTRAINT "mpbc_development_plan_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id");



ALTER TABLE ONLY "public"."mpbc_development_plan"
    ADD CONSTRAINT "mpbc_development_plan_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."mpbc_person"("id");



ALTER TABLE ONLY "public"."mpbc_development_plan_progress"
    ADD CONSTRAINT "mpbc_development_plan_progress_development_plan_id_fkey" FOREIGN KEY ("development_plan_id") REFERENCES "public"."mpbc_development_plan"("id");



ALTER TABLE ONLY "public"."mpbc_development_plan"
    ADD CONSTRAINT "mpbc_development_plan_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."mpbc_season"("id");



ALTER TABLE ONLY "public"."mpbc_goal_tracking"
    ADD CONSTRAINT "mpbc_goal_tracking_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mpbc_group"("id");



ALTER TABLE ONLY "public"."mpbc_group"
    ADD CONSTRAINT "mpbc_group_lead_person_id_fkey" FOREIGN KEY ("lead_person_id") REFERENCES "public"."mpbc_person"("id");



ALTER TABLE ONLY "public"."mpbc_message_threads"
    ADD CONSTRAINT "mpbc_message_threads_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mpbc_messages"
    ADD CONSTRAINT "mpbc_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mpbc_messages"
    ADD CONSTRAINT "mpbc_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."mpbc_message_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mpbc_observations"
    ADD CONSTRAINT "mpbc_observations_observer_id_fkey" FOREIGN KEY ("observer_id") REFERENCES "public"."mpbc_person"("id");



ALTER TABLE ONLY "public"."mpbc_observations"
    ADD CONSTRAINT "mpbc_observations_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."mpbc_person"("id");



ALTER TABLE ONLY "public"."mpbc_person"
    ADD CONSTRAINT "mpbc_person_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mpbc_person_group"
    ADD CONSTRAINT "mpbc_person_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mpbc_group"("id");



ALTER TABLE ONLY "public"."mpbc_person_group"
    ADD CONSTRAINT "mpbc_person_group_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mpbc_organizations"("id");



ALTER TABLE ONLY "public"."mpbc_person_group"
    ADD CONSTRAINT "mpbc_person_group_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mpbc_person"("id");



ALTER TABLE ONLY "public"."mpbc_person"
    ADD CONSTRAINT "mpbc_person_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mpbc_person_relationships"
    ADD CONSTRAINT "mpbc_person_relationships_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mpbc_person"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mpbc_person_relationships"
    ADD CONSTRAINT "mpbc_person_relationships_related_person_id_fkey" FOREIGN KEY ("related_person_id") REFERENCES "public"."mpbc_person"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mpbc_person_role"
    ADD CONSTRAINT "mpbc_person_role_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mpbc_person_role"
    ADD CONSTRAINT "mpbc_person_role_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."mpbc_person_role"
    ADD CONSTRAINT "mpbc_person_role_organization_id_fkey1" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."mpbc_person_role"
    ADD CONSTRAINT "mpbc_person_role_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mpbc_person_role"
    ADD CONSTRAINT "mpbc_person_role_person_id_fkey1" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id");



ALTER TABLE ONLY "public"."mpbc_player_skill_challenge"
    ADD CONSTRAINT "mpbc_player_skill_challenge_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."mpbc_person"("id");



ALTER TABLE ONLY "public"."mpbc_player_skill_challenge"
    ADD CONSTRAINT "mpbc_player_skill_challenge_development_plan_id_fkey" FOREIGN KEY ("development_plan_id") REFERENCES "public"."mpbc_development_plan"("id");



ALTER TABLE ONLY "public"."mpbc_player_skill_challenge"
    ADD CONSTRAINT "mpbc_player_skill_challenge_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."mpbc_person"("id");



ALTER TABLE ONLY "public"."mpbc_player_skill_challenge"
    ADD CONSTRAINT "mpbc_player_skill_challenge_skill_tag_id_fkey" FOREIGN KEY ("skill_tag_id") REFERENCES "public"."mpbc_skill_tag"("id");



ALTER TABLE ONLY "public"."mpbc_player_skill_challenge"
    ADD CONSTRAINT "mpbc_player_skill_challenge_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."mpbc_person"("id");



ALTER TABLE ONLY "public"."mpbc_thread_participants"
    ADD CONSTRAINT "mpbc_thread_participants_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."mpbc_message_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mpbc_thread_participants"
    ADD CONSTRAINT "mpbc_thread_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."infrastructure_notification_queue"
    ADD CONSTRAINT "notification_queue_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."infrastructure_participation_log"
    ADD CONSTRAINT "participation_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."infrastructure_participation_log"
    ADD CONSTRAINT "participation_log_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."infrastructure_sessions"("id");



ALTER TABLE ONLY "public"."mp_core_person_group"
    ADD CONSTRAINT "person_group_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "public"."infrastructure_program_cycle"("id");



ALTER TABLE ONLY "public"."mp_core_person_group"
    ADD CONSTRAINT "person_group_org_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."mp_core_person_role"
    ADD CONSTRAINT "person_role_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."infrastructure_program_cycle"
    ADD CONSTRAINT "program_cycle_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."mpbc_session_participation"
    ADD CONSTRAINT "session_participation_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."mpbc_practice_session"("id");



ALTER TABLE ONLY "public"."infrastructure_sessions"
    ADD CONSTRAINT "sessions_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "public"."infrastructure_program_cycle"("id");



ALTER TABLE ONLY "public"."infrastructure_sessions"
    ADD CONSTRAINT "sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."infrastructure_system_settings"
    ADD CONSTRAINT "system_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id");



ALTER TABLE ONLY "public"."mpbc_template_usage_log"
    ADD CONSTRAINT "template_usage_log_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."mpbc_practice_templates_enhanced"("id");



CREATE POLICY "Admin can delete all in org" ON "public"."mp_core_person" FOR DELETE TO "authenticated" USING (("organization_id" IN ( SELECT "p"."organization_id"
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = "auth"."uid"()) AND ("p"."is_admin" = true)))));



CREATE POLICY "Admin can insert in org" ON "public"."mp_core_person" FOR INSERT TO "authenticated" WITH CHECK (("organization_id" IN ( SELECT "p"."organization_id"
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = "auth"."uid"()) AND ("p"."is_admin" = true)))));



CREATE POLICY "Admin can select all in org" ON "public"."mp_core_person" FOR SELECT TO "authenticated" USING (("organization_id" IN ( SELECT "p"."organization_id"
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = "auth"."uid"()) AND ("p"."is_admin" = true)))));



CREATE POLICY "Admin can update all in org" ON "public"."mp_core_person" FOR UPDATE TO "authenticated" USING (("organization_id" IN ( SELECT "p"."organization_id"
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = "auth"."uid"()) AND ("p"."is_admin" = true)))));



CREATE POLICY "Allow authenticated users to insert their own record" ON "public"."mp_core_person" FOR INSERT WITH CHECK (("auth_uid" = "auth"."uid"()));



CREATE POLICY "Allow authenticated users to read their own record" ON "public"."mp_core_person" FOR SELECT USING (("auth_uid" = "auth"."uid"()));



CREATE POLICY "Allow authenticated users to update their own record" ON "public"."mp_core_person" FOR UPDATE USING (("auth_uid" = "auth"."uid"())) WITH CHECK (("auth_uid" = "auth"."uid"()));



CREATE POLICY "Allow organization admins to create person records" ON "public"."mp_core_person" FOR INSERT WITH CHECK ("public"."is_org_admin"("organization_id", "auth"."uid"()));



CREATE POLICY "Allow organization admins to delete person records" ON "public"."mp_core_person" FOR DELETE USING ("public"."is_org_admin"("organization_id", "auth"."uid"()));



CREATE POLICY "Allow organization admins to read person records" ON "public"."mp_core_person" FOR SELECT USING ("public"."is_org_admin"("organization_id", "auth"."uid"()));



CREATE POLICY "Allow organization admins to update person records" ON "public"."mp_core_person" FOR UPDATE USING ("public"."is_org_admin"("organization_id", "auth"."uid"()));



CREATE POLICY "Allow read for all" ON "public"."mpbc_player_skill_challenge" FOR SELECT USING (true);



CREATE POLICY "Allow read for all" ON "public"."mpbc_skill_tag" FOR SELECT USING (true);



CREATE POLICY "Authenticated can select organizations" ON "public"."mpbc_organizations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view organizations" ON "public"."mp_core_organizations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Coach can insert own record in org" ON "public"."mp_core_person" FOR INSERT TO "authenticated" WITH CHECK ((("auth_uid" = "auth"."uid"()) AND ("person_type" = 'coach'::"text")));



CREATE POLICY "Coach can select own record in org" ON "public"."mp_core_person" FOR SELECT TO "authenticated" USING ((("auth_uid" = "auth"."uid"()) AND ("person_type" = 'coach'::"text")));



CREATE POLICY "Superadmin can delete all" ON "public"."mp_core_person" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = "auth"."uid"()) AND ("p"."is_superadmin" = true)))));



CREATE POLICY "Superadmin can insert all" ON "public"."mp_core_person" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = "auth"."uid"()) AND ("p"."is_superadmin" = true)))));



CREATE POLICY "Superadmin can select all" ON "public"."mp_core_person" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = "auth"."uid"()) AND ("p"."is_superadmin" = true)))));



CREATE POLICY "Superadmin can update all" ON "public"."mp_core_person" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = "auth"."uid"()) AND ("p"."is_superadmin" = true)))));



ALTER TABLE "public"."infrastructure_dashboard_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."infrastructure_file_storage" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "infrastructure_file_storage_delete_policy" ON "public"."infrastructure_file_storage" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE (("ur"."is_superadmin" = true) OR ("ur"."person_id" = "infrastructure_file_storage"."uploaded_by") OR (("ur"."is_admin" = true) AND ("ur"."organization_id" = "infrastructure_file_storage"."organization_id"))))));



CREATE POLICY "infrastructure_file_storage_insert_policy" ON "public"."infrastructure_file_storage" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE (("ur"."is_superadmin" = true) OR ("ur"."organization_id" = "infrastructure_file_storage"."organization_id")))));



CREATE POLICY "infrastructure_file_storage_policy" ON "public"."infrastructure_file_storage" FOR SELECT USING ((("public_access" = true) OR (EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE (("ur"."is_superadmin" = true) OR ("infrastructure_file_storage"."uploaded_by" = "ur"."person_id")))) OR (("entity_type" = 'person'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."mp_core_person" "p"
  WHERE ("p"."id" = "infrastructure_file_storage"."entity_id"))))));



CREATE POLICY "infrastructure_file_storage_update_policy" ON "public"."infrastructure_file_storage" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE (("ur"."is_superadmin" = true) OR ("ur"."person_id" = "infrastructure_file_storage"."uploaded_by") OR (("ur"."is_admin" = true) AND ("ur"."organization_id" = "infrastructure_file_storage"."organization_id"))))));



ALTER TABLE "public"."infrastructure_notification_queue" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "infrastructure_notification_queue_select_policy" ON "public"."infrastructure_notification_queue" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE (("ur"."is_superadmin" = true) OR ("ur"."person_id" = "infrastructure_notification_queue"."recipient_id")))));



ALTER TABLE "public"."infrastructure_participation_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."infrastructure_program_cycle" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."infrastructure_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "infrastructure_sessions_select_policy" ON "public"."infrastructure_sessions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE ("ur"."is_superadmin" = true))) OR (EXISTS ( SELECT 1
   FROM ("public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
     JOIN "public"."mp_core_group" "g" ON (("g"."id" = "infrastructure_sessions"."group_id")))
  WHERE (("ur"."organization_id" = "g"."organization_id") AND (("ur"."is_admin" = true) OR ("infrastructure_sessions"."group_id" = ANY ("ur"."team_ids"))))))));



CREATE POLICY "infrastructure_sessions_update_policy" ON "public"."infrastructure_sessions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
     JOIN "public"."mp_core_group" "g" ON (("g"."id" = "infrastructure_sessions"."group_id")))
  WHERE (("ur"."is_superadmin" = true) OR (("ur"."is_admin" = true) AND ("ur"."organization_id" = "g"."organization_id")) OR (("ur"."role" = 'coach'::"text") AND ("infrastructure_sessions"."group_id" = ANY ("ur"."team_ids")))))));



ALTER TABLE "public"."infrastructure_system_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mp_core_actions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "mp_core_actions_select_policy" ON "public"."mp_core_actions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE (("ur"."is_superadmin" = true) OR ("ur"."person_id" = "mp_core_actions"."person_id")))) OR (EXISTS ( SELECT 1
   FROM ("public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
     JOIN "public"."mp_core_person_group" "mpg" ON (("mpg"."person_id" = "mp_core_actions"."person_id")))
  WHERE (("ur"."role" = 'coach'::"text") AND ("mpg"."group_id" = ANY ("ur"."team_ids")) AND ("mpg"."status" = 'active'::"text")))) OR (EXISTS ( SELECT 1
   FROM ("public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
     JOIN "public"."mp_core_person" "p" ON (("p"."id" = "mp_core_actions"."person_id")))
  WHERE (("ur"."is_admin" = true) AND ("ur"."organization_id" = "p"."organization_id"))))));



CREATE POLICY "mp_core_actions_update_policy" ON "public"."mp_core_actions" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE (("ur"."is_superadmin" = true) OR ("ur"."person_id" = "mp_core_actions"."person_id")))) OR (EXISTS ( SELECT 1
   FROM ("public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
     JOIN "public"."mp_core_person_group" "mpg" ON (("mpg"."person_id" = "mp_core_actions"."person_id")))
  WHERE (("ur"."role" = ANY (ARRAY['coach'::"text", 'admin'::"text"])) AND ("mpg"."group_id" = ANY ("ur"."team_ids")) AND ("mpg"."status" = 'active'::"text"))))));



CREATE POLICY "mp_core_group_insert_policy" ON "public"."mp_core_group" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE (("ur"."is_superadmin" = true) OR (("ur"."is_admin" = true) AND ("ur"."organization_id" = "mp_core_group"."organization_id"))))));



CREATE POLICY "mp_core_group_select_policy" ON "public"."mp_core_group" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE (("ur"."is_superadmin" = true) OR ("ur"."organization_id" = "mp_core_group"."organization_id")))));



CREATE POLICY "mp_core_group_update_policy" ON "public"."mp_core_group" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE (("ur"."is_superadmin" = true) OR (("ur"."is_admin" = true) AND ("ur"."organization_id" = "mp_core_group"."organization_id")) OR (("ur"."role" = 'coach'::"text") AND ("mp_core_group"."id" = ANY ("ur"."team_ids")))))));



ALTER TABLE "public"."mp_core_intentions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "mp_core_intentions_select_policy" ON "public"."mp_core_intentions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE ("ur"."is_superadmin" = true))) OR (EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE ("ur"."person_id" = "mp_core_intentions"."person_id"))) OR (EXISTS ( SELECT 1
   FROM ("public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
     JOIN "public"."mp_core_person_group" "mpg" ON (("mpg"."person_id" = "mp_core_intentions"."person_id")))
  WHERE (("ur"."role" = 'coach'::"text") AND ("mpg"."group_id" = ANY ("ur"."team_ids")) AND ("mpg"."status" = 'active'::"text")))) OR (EXISTS ( SELECT 1
   FROM ("public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
     JOIN "public"."mp_core_person" "p" ON (("p"."id" = "mp_core_intentions"."person_id")))
  WHERE (("ur"."is_admin" = true) AND ("ur"."organization_id" = "p"."organization_id"))))));



CREATE POLICY "mp_core_intentions_update_policy" ON "public"."mp_core_intentions" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE ("ur"."is_superadmin" = true))) OR (EXISTS ( SELECT 1
   FROM ("public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
     JOIN "public"."mp_core_person_group" "mpg" ON (("mpg"."person_id" = "mp_core_intentions"."person_id")))
  WHERE (("ur"."role" = 'coach'::"text") AND ("mpg"."group_id" = ANY ("ur"."team_ids")) AND ("mpg"."status" = 'active'::"text")))) OR (EXISTS ( SELECT 1
   FROM ("public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
     JOIN "public"."mp_core_person" "p" ON (("p"."id" = "mp_core_intentions"."person_id")))
  WHERE (("ur"."is_admin" = true) AND ("ur"."organization_id" = "p"."organization_id"))))));



CREATE POLICY "mp_core_person_group_select_policy" ON "public"."mp_core_person_group" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE ("ur"."is_superadmin" = true))) OR (EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE ("ur"."person_id" = "mp_core_person_group"."person_id"))) OR (EXISTS ( SELECT 1
   FROM ("public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
     JOIN "public"."mp_core_group" "g" ON (("g"."id" = "mp_core_person_group"."group_id")))
  WHERE (("ur"."is_admin" = true) AND ("ur"."organization_id" = "g"."organization_id")))) OR (EXISTS ( SELECT 1
   FROM "public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
  WHERE (("ur"."role" = 'coach'::"text") AND ("mp_core_person_group"."group_id" = ANY ("ur"."team_ids")))))));



CREATE POLICY "mp_core_person_group_update_policy" ON "public"."mp_core_person_group" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."get_user_role"() "ur"("person_id", "organization_id", "role", "is_superadmin", "is_admin", "team_ids")
     JOIN "public"."mp_core_group" "g" ON (("g"."id" = "mp_core_person_group"."group_id")))
  WHERE (("ur"."is_superadmin" = true) OR (("ur"."is_admin" = true) AND ("ur"."organization_id" = "g"."organization_id")) OR (("ur"."role" = 'coach'::"text") AND ("mp_core_person_group"."group_id" = ANY ("ur"."team_ids")))))));



ALTER TABLE "public"."mp_core_reflections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mp_philosophy_arc_advancement" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mp_philosophy_arc_collective" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mp_philosophy_arc_responsibility" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mp_philosophy_challenge_point" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mpbc_group" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mpbc_organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mpbc_person" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mpbc_person_group" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mpbc_player_skill_challenge" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mpbc_practice_theme" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mpbc_skill_prerequisites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mpbc_skill_tag" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "program_cycle_delete_policy" ON "public"."infrastructure_program_cycle" FOR DELETE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = ( SELECT "auth"."uid"() AS "uid")) AND ("p"."is_superadmin" = true)))) OR ((((("auth"."jwt"() ->> 'app_metadata'::"text"))::"jsonb" ->> 'organization_id'::"text") = ("organization_id")::"text") AND (EXISTS ( SELECT 1
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = ( SELECT "auth"."uid"() AS "uid")) AND ("p"."is_admin" = true)))))));



CREATE POLICY "program_cycle_insert_policy" ON "public"."infrastructure_program_cycle" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = ( SELECT "auth"."uid"() AS "uid")) AND ("p"."is_superadmin" = true)))) OR ((((("auth"."jwt"() ->> 'app_metadata'::"text"))::"jsonb" ->> 'organization_id'::"text") = ("organization_id")::"text") AND (EXISTS ( SELECT 1
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = ( SELECT "auth"."uid"() AS "uid")) AND ("p"."is_admin" = true)))))));



CREATE POLICY "program_cycle_select_policy" ON "public"."infrastructure_program_cycle" FOR SELECT TO "authenticated" USING ((("organization_id")::"text" = ((("auth"."jwt"() ->> 'app_metadata'::"text"))::"jsonb" ->> 'organization_id'::"text")));



CREATE POLICY "program_cycle_update_policy" ON "public"."infrastructure_program_cycle" FOR UPDATE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = ( SELECT "auth"."uid"() AS "uid")) AND ("p"."is_superadmin" = true)))) OR ((((("auth"."jwt"() ->> 'app_metadata'::"text"))::"jsonb" ->> 'organization_id'::"text") = ("organization_id")::"text") AND (EXISTS ( SELECT 1
   FROM "public"."mp_core_person" "p"
  WHERE (("p"."auth_uid" = ( SELECT "auth"."uid"() AS "uid")) AND ("p"."is_admin" = true)))))));



CREATE POLICY "temp_allow_all_authenticated_read_mpbc_group" ON "public"."mpbc_group" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "temp_allow_all_authenticated_read_mpbc_person" ON "public"."mpbc_person" FOR SELECT TO "authenticated" USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "anon";
















































































































































SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



























GRANT ALL ON FUNCTION "public"."get_current_coach_attributes"() TO "authenticated";



GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";


















GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."infrastructure_program_cycle" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."mp_core_group" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."mp_core_person" TO "authenticated";
GRANT ALL ON TABLE "public"."mp_core_person" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."mp_core_person_group" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."infrastructure_dashboard_config" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."infrastructure_file_storage" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."infrastructure_invites" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."infrastructure_memberships" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."infrastructure_notification_queue" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."infrastructure_participation_log" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."infrastructure_sessions" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."infrastructure_system_settings" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."mp_core_actions" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."mp_core_intentions" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."mp_core_organizations" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."mp_core_person_role" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."mp_core_reflections" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."mpbc_development_plan" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."mpbc_development_plan" TO "authenticated";



GRANT ALL ON TABLE "public"."mpbc_observations" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."mpbc_observations" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."mpbc_skill_tag" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."v_mp_core_group_membership" TO "authenticated";

































RESET ALL;
