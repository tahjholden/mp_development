--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.13 (Homebrew)

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

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: group_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.group_type AS ENUM (
    'team',
    'pod',
    'session'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: count_active_players(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.count_active_players() RETURNS integer
    LANGUAGE plpgsql
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


--
-- Name: get_current_coach_attributes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_coach_attributes() RETURNS TABLE(coach_auth_uid uuid, org_id uuid, is_admin boolean, is_superadmin boolean)
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: get_user_organization_access(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_organization_access() RETURNS TABLE(org_id uuid, role_name text, is_superadmin boolean)
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: get_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_role() RETURNS TABLE(person_id uuid, organization_id uuid, role text, is_superadmin boolean, is_admin boolean, team_ids uuid[])
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO mp_core_person (id, user_id, display_name, organization_id, person_type)
  VALUES (gen_random_uuid(), NEW.id, NEW.email, '<your-org-id>', 'coach');
  RETURN NEW;
END;
$$;


--
-- Name: is_org_admin(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_org_admin(p_org_id uuid, p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: log_activity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_activity() RETURNS trigger
    LANGUAGE plpgsql
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


--
-- Name: log_observation_activity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_observation_activity() RETURNS trigger
    LANGUAGE plpgsql
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


--
-- Name: log_pdp_activity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_pdp_activity() RETURNS trigger
    LANGUAGE plpgsql
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


--
-- Name: set_null_start_date(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_null_start_date() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE pdp
    SET start_date = created_at
    WHERE start_date IS NULL;
END;
$$;


--
-- Name: update_dashboard_config_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_dashboard_config_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_development_goals_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_development_goals_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_development_plan_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_development_plan_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_groups_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_groups_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_observations_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_observations_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_organization_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_organization_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_person_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_person_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_reflection_log_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_reflection_log_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_sessions_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_sessions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_system_settings_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_system_settings_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: infrastructure_program_cycle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.infrastructure_program_cycle (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    name text NOT NULL,
    year integer NOT NULL,
    term text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    description text,
    objectives text[],
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- Name: mp_core_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_core_group (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    group_type text,
    lead_person_id uuid,
    organization_id uuid,
    program text,
    level_category text,
    description text,
    max_capacity integer,
    schedule jsonb,
    active boolean DEFAULT true,
    created_by uuid,
    updated_by uuid
);


--
-- Name: TABLE mp_core_group; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mp_core_group IS 'Group table with simplified RLS policies that allow:
1. All authenticated users to read groups
2. Users to update/insert groups in their organization
3. Admins to perform all operations on all groups';


--
-- Name: mp_core_person; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_core_person (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    first_name text,
    last_name text,
    email text,
    phone text,
    notes text,
    person_type text,
    organization_id uuid,
    is_admin boolean DEFAULT false,
    is_superadmin boolean DEFAULT false,
    active boolean DEFAULT true,
    date_of_birth date,
    emergency_contact jsonb,
    profile_image_url text,
    medical_info jsonb,
    parent_guardian_info jsonb,
    created_by uuid,
    updated_by uuid,
    auth_uid uuid,
    stripe_customer_id text,
    stripe_subscription_id text,
    stripe_product_id text,
    plan_name text,
    subscription_status text,
    seats_purchased integer DEFAULT 1,
    seats_used integer DEFAULT 1
);


--
-- Name: TABLE mp_core_person; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mp_core_person IS 'Core person table with simplified RLS policies that allow:
1. All authenticated users to read person records
2. Users to update their own records
3. Users to insert records with their own auth_uid
4. Admins to perform all operations on all records';


--
-- Name: COLUMN mp_core_person.person_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_person.person_type IS 'Type of person: coach, player, admin, parent';


--
-- Name: COLUMN mp_core_person.organization_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_person.organization_id IS 'Organization this person belongs to';


--
-- Name: COLUMN mp_core_person.auth_uid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_person.auth_uid IS 'Supabase auth user ID';


--
-- Name: mp_core_person_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_core_person_group (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    person_id uuid,
    group_id uuid,
    role text NOT NULL,
    organization_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    cycle_id uuid,
    "position" text,
    identifier text,
    status text DEFAULT 'active'::text,
    metadata jsonb,
    joined_at timestamp with time zone DEFAULT now(),
    left_at timestamp with time zone,
    created_by uuid,
    updated_at timestamp with time zone,
    payer_id uuid
);


--
-- Name: current_participants; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.current_participants WITH (security_invoker='on') AS
 SELECT p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.person_type,
    p.auth_uid,
    pg.group_id,
    g.name AS group_name,
    pg.role,
    pg."position",
    pg.identifier,
    pc.name AS cycle_name,
    p.organization_id
   FROM (((public.mp_core_person p
     JOIN public.mp_core_person_group pg ON ((p.id = pg.person_id)))
     JOIN public.mp_core_group g ON ((pg.group_id = g.id)))
     LEFT JOIN public.infrastructure_program_cycle pc ON ((pg.cycle_id = pc.id)))
  WHERE (g.active = true);


--
-- Name: infrastructure_activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.infrastructure_activity_logs (
    action text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    ip_address character varying(45),
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    person_id uuid,
    organization_id uuid
);


--
-- Name: infrastructure_dashboard_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.infrastructure_dashboard_config (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    person_id uuid,
    dashboard_type text NOT NULL,
    widget_config jsonb NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    organization_id uuid
);


--
-- Name: infrastructure_file_storage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.infrastructure_file_storage (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    file_name text NOT NULL,
    original_name text NOT NULL,
    file_path text NOT NULL,
    file_type text NOT NULL,
    file_size integer,
    bucket_name text NOT NULL,
    entity_type text,
    entity_id uuid,
    uploaded_by uuid,
    description text,
    tags text[],
    public_access boolean DEFAULT false,
    thumbnail_path text,
    processing_status text DEFAULT 'uploaded'::text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    organization_id uuid
);


--
-- Name: infrastructure_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.infrastructure_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    email text NOT NULL,
    role text NOT NULL,
    invited_by uuid NOT NULL,
    invited_at timestamp without time zone DEFAULT now() NOT NULL,
    status text NOT NULL
);


--
-- Name: infrastructure_invites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.infrastructure_invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    organization_id uuid,
    role text DEFAULT 'member'::text,
    status text DEFAULT 'pending'::text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: infrastructure_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.infrastructure_memberships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    organization_id uuid,
    role text DEFAULT 'member'::text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT memberships_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])))
);


--
-- Name: infrastructure_notification_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.infrastructure_notification_queue (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    recipient_id uuid NOT NULL,
    notification_type text NOT NULL,
    subject text,
    message text NOT NULL,
    data jsonb,
    priority integer DEFAULT 3,
    status text DEFAULT 'queued'::text,
    scheduled_for timestamp with time zone DEFAULT now(),
    sent_at timestamp with time zone,
    error_message text,
    retry_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    organization_id uuid
);


--
-- Name: infrastructure_participation_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.infrastructure_participation_log (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    session_id uuid,
    person_id uuid,
    status text NOT NULL,
    arrival_time time without time zone,
    departure_time time without time zone,
    participation_level integer,
    energy_level integer,
    focus_level integer,
    notes text,
    absence_reason text,
    advance_notice boolean DEFAULT false,
    makeup_required boolean DEFAULT false,
    metadata jsonb,
    recorded_at timestamp with time zone DEFAULT now(),
    recorded_by uuid,
    organization_id uuid
);


--
-- Name: infrastructure_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.infrastructure_sessions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    group_id uuid,
    cycle_id uuid,
    session_number integer,
    session_type text DEFAULT 'regular'::text,
    date date NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    location text,
    session_objective text,
    pre_session_notes text,
    post_session_notes text,
    facilitator_reflection text,
    intensity_level integer,
    status text DEFAULT 'planned'::text,
    expected_attendance integer,
    actual_attendance integer,
    conditions text,
    equipment_issues text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    organization_id uuid
);


--
-- Name: infrastructure_system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.infrastructure_system_settings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    category text NOT NULL,
    setting_key text NOT NULL,
    setting_value jsonb NOT NULL,
    description text,
    data_type text NOT NULL,
    is_public boolean DEFAULT false,
    requires_restart boolean DEFAULT false,
    last_changed_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invitations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invitations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invitations_id_seq OWNED BY public.infrastructure_invitations.id;


--
-- Name: mp_core_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_core_actions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    person_id uuid,
    group_id uuid,
    intention_id uuid,
    title text NOT NULL,
    description text,
    status text DEFAULT 'planned'::character varying,
    executed_at timestamp with time zone,
    duration_minutes integer,
    challenge_level integer,
    success_rate numeric(5,2),
    benchmark_assessments jsonb,
    advancement_progress jsonb,
    responsibility_progress jsonb,
    challenge_rating integer,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: COLUMN mp_core_actions.challenge_level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_actions.challenge_level IS 'Challenge level of this action (1-5)';


--
-- Name: COLUMN mp_core_actions.success_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_actions.success_rate IS 'Success rate achieved (0-1)';


--
-- Name: COLUMN mp_core_actions.benchmark_assessments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_actions.benchmark_assessments IS 'Benchmarks assessed during this action';


--
-- Name: COLUMN mp_core_actions.advancement_progress; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_actions.advancement_progress IS 'Progress on advancement dimension';


--
-- Name: COLUMN mp_core_actions.responsibility_progress; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_actions.responsibility_progress IS 'Progress on responsibility dimension';


--
-- Name: mp_core_intentions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_core_intentions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    person_id uuid,
    group_id uuid,
    title text NOT NULL,
    description text,
    target_date date,
    status text DEFAULT 'active'::character varying,
    challenge_level integer DEFAULT 3,
    benchmark_targets jsonb,
    development_stage text,
    advancement_level integer,
    responsibility_tier integer,
    progress_percentage integer DEFAULT 0,
    domain_code text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    cla_category_focus text,
    optimal_challenge_level integer,
    context_complexity_rating integer
);


--
-- Name: COLUMN mp_core_intentions.challenge_level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_intentions.challenge_level IS 'Initial challenge level (1-5)';


--
-- Name: COLUMN mp_core_intentions.benchmark_targets; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_intentions.benchmark_targets IS 'Target benchmarks for this intention';


--
-- Name: COLUMN mp_core_intentions.development_stage; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_intentions.development_stage IS 'Stage in development arc';


--
-- Name: COLUMN mp_core_intentions.advancement_level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_intentions.advancement_level IS 'Target advancement level for this intention';


--
-- Name: COLUMN mp_core_intentions.responsibility_tier; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_intentions.responsibility_tier IS 'Target responsibility tier for this intention';


--
-- Name: mp_core_organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_core_organizations (
    name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text DEFAULT 'sports'::text NOT NULL,
    description text,
    logo_url text,
    contact_info jsonb DEFAULT '{}'::jsonb,
    settings jsonb DEFAULT '{}'::jsonb,
    subscription_tier text DEFAULT 'basic'::text,
    overlay_version text DEFAULT 'mpbc-v1.0'::text,
    active boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mp_core_organizations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mp_core_organizations IS 'Organization table with simplified RLS policies that allow:
1. All authenticated users to read organizations
2. Users to update organizations they belong to
3. Admins to perform all operations on all organizations';


--
-- Name: mp_core_person_role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_core_person_role (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    person_id uuid,
    organization_id uuid,
    role text NOT NULL,
    permissions text[] DEFAULT '{}'::text[],
    scope_type text,
    scope_ids uuid[],
    active boolean DEFAULT true,
    started_at timestamp with time zone DEFAULT now(),
    ended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- Name: mp_core_reflections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_core_reflections (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    person_id uuid,
    group_id uuid,
    action_id uuid,
    intention_id uuid,
    content text NOT NULL,
    insights text,
    next_steps text,
    challenge_feedback text,
    perceived_difficulty integer,
    development_insights jsonb,
    benchmark_progress jsonb,
    advancement_insights text,
    responsibility_insights text,
    collective_insights text,
    advancement_progress jsonb,
    responsibility_progress jsonb,
    collective_progress jsonb,
    confidence_score integer,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: COLUMN mp_core_reflections.challenge_feedback; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_reflections.challenge_feedback IS 'Feedback on challenge level';


--
-- Name: COLUMN mp_core_reflections.perceived_difficulty; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_reflections.perceived_difficulty IS 'How difficult it felt (1-10)';


--
-- Name: COLUMN mp_core_reflections.development_insights; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_reflections.development_insights IS 'Insights related to development arc';


--
-- Name: COLUMN mp_core_reflections.benchmark_progress; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_reflections.benchmark_progress IS 'Progress toward benchmarks';


--
-- Name: COLUMN mp_core_reflections.advancement_insights; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_reflections.advancement_insights IS 'Insights on advancement dimension';


--
-- Name: COLUMN mp_core_reflections.responsibility_insights; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_reflections.responsibility_insights IS 'Insights on responsibility dimension';


--
-- Name: COLUMN mp_core_reflections.collective_insights; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mp_core_reflections.collective_insights IS 'Insights on collective growth dimension';


--
-- Name: mp_philosophy_arc_advancement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_philosophy_arc_advancement (
    level bigint,
    title text,
    description text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: mp_philosophy_arc_collective; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_philosophy_arc_collective (
    phase bigint,
    title text,
    description text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: mp_philosophy_arc_responsibility; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_philosophy_arc_responsibility (
    tier bigint,
    title text,
    description text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: mp_philosophy_arc_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_philosophy_arc_types (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    domain_code text NOT NULL,
    stages jsonb NOT NULL,
    typical_duration_days integer,
    default_graduation_threshold numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: mp_philosophy_benchmark_framework; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_philosophy_benchmark_framework (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    measurement_types jsonb NOT NULL,
    progression_rules jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: mp_philosophy_challenge_point; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mp_philosophy_challenge_point (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text,
    description text,
    calculation_rules jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: mpbc_age_bands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_age_bands (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text,
    min_age integer,
    max_age integer,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_age_bands; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_age_bands IS 'Age bands for categorizing players by development stage';


--
-- Name: mpbc_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_audit_log (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    table_name text,
    record_id uuid,
    action text,
    new_values jsonb,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT now()
);


--
-- Name: mpbc_benchmark_constraints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_benchmark_constraints (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    cla_benchmark_id uuid,
    constraint_id uuid,
    priority integer,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: mpbc_block_player_assignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_block_player_assignment (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    block_id uuid,
    player_id uuid,
    special_role text,
    constraints jsonb,
    objectives text,
    modifications text,
    performance_notes text,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- Name: mpbc_cla_benchmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_cla_benchmarks (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    cla_category_id uuid,
    age_band_id uuid,
    context text,
    assessment_criteria text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    benchmark_category_id uuid,
    advancement_level text
);


--
-- Name: TABLE mpbc_cla_benchmarks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_cla_benchmarks IS 'Competency Level Assessment benchmarks for player evaluation';


--
-- Name: mpbc_cla_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_cla_categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text,
    description text,
    learning_focus text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_cla_categories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_cla_categories IS 'Categories for Competency Level Assessment framework';


--
-- Name: mpbc_coach_template_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_coach_template_preferences (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    coach_id uuid,
    template_id uuid,
    preference_score integer,
    usage_frequency integer,
    last_used timestamp with time zone,
    preferred_modifications jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_coach_template_preferences; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_coach_template_preferences IS 'Coach preferences for development plan templates';


--
-- Name: mpbc_constraint_manipulations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_constraint_manipulations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text,
    description text,
    constraint_type text,
    cla_category_id uuid,
    challenge_level integer,
    implementation_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_constraint_manipulations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_constraint_manipulations IS 'Constraint-based coaching manipulations for drills';


--
-- Name: mpbc_constraint_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_constraint_type (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text,
    description text,
    category text,
    application_method text,
    example_implementations jsonb,
    intensity_scalable boolean,
    attendance_adaptable boolean,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: mpbc_constraints_bank; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_constraints_bank (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    constraint_name text,
    constraint_text text,
    skill_tag text,
    offensive_or_defensive text,
    constraint_type text,
    example_contexts text,
    confidence_score numeric,
    notes text,
    prompt_keywords text,
    ai_parsing_rules jsonb
);


--
-- Name: mpbc_core_person_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_core_person_profile (
    person_id uuid NOT NULL,
    organization_id uuid,
    height_cm integer,
    dominant_hand text,
    playing_position text,
    preferred_shot_zone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    advancement_level text,
    responsibility_tier text,
    basketball_profile jsonb
);


--
-- Name: TABLE mpbc_core_person_profile; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_core_person_profile IS 'Basketball-specific profile data for players';


--
-- Name: COLUMN mpbc_core_person_profile.height_cm; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mpbc_core_person_profile.height_cm IS 'Player height in centimeters';


--
-- Name: COLUMN mpbc_core_person_profile.dominant_hand; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mpbc_core_person_profile.dominant_hand IS 'Player''s dominant hand (left/right)';


--
-- Name: COLUMN mpbc_core_person_profile.playing_position; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mpbc_core_person_profile.playing_position IS 'Primary playing position on the court';


--
-- Name: COLUMN mpbc_core_person_profile.preferred_shot_zone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mpbc_core_person_profile.preferred_shot_zone IS 'Preferred area on the court for shooting';


--
-- Name: mpbc_core_skill_mapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_core_skill_mapping (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    mpbc_skill_id uuid,
    core_skill_name text,
    mapping_strength integer,
    mapping_context text,
    created_at timestamp with time zone DEFAULT now(),
    core_skill_id uuid,
    relationship_type text,
    ai_confidence_score integer,
    development_priority integer,
    contextual_factors jsonb,
    skill_transfer_coefficient double precision,
    optimal_age_range text,
    prerequisite_skills text[],
    complementary_skills text[]
);


--
-- Name: mpbc_core_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_core_skills (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    display_name text,
    category text,
    subcategory text,
    description text,
    synonyms text[],
    is_active boolean DEFAULT true,
    parent_skill_id uuid,
    use_case text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    combo_code text
);


--
-- Name: TABLE mpbc_core_skills; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_core_skills IS 'Core basketball skills taxonomy';


--
-- Name: mpbc_cue_pack; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_cue_pack (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text,
    skill_tag_id uuid,
    phase_id uuid,
    cue_type text,
    cues text[],
    when_to_use text,
    example_scenarios text,
    effectiveness_rating integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: mpbc_development_plan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_development_plan (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    player_id uuid,
    group_id uuid,
    season_id uuid,
    initial_observation text,
    objective text,
    primary_pillar_id uuid,
    secondary_pillar_id uuid,
    focus_skills_id uuid,
    target_outcomes text,
    baseline_assessment text,
    target_metrics jsonb,
    timeline_weeks integer,
    priority_level text,
    status text,
    progress_percentage integer,
    last_review_date timestamp with time zone,
    next_review_date timestamp with time zone,
    progress_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    cla_primary_benchmark_id uuid,
    cla_secondary_benchmark_id uuid,
    cla_tertiary_benchmark_id uuid,
    intelligence_development_goals jsonb,
    context_assessment_enabled boolean,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    archived_at timestamp with time zone,
    archived_by uuid,
    target_end_date timestamp with time zone,
    actual_end_date timestamp with time zone,
    org_id uuid,
    organization_id uuid,
    version text,
    overlay_schema text,
    cycle_id uuid,
    person_id uuid,
    metadata jsonb,
    old_id uuid,
    migration_phase text,
    needs_enhancement boolean,
    original_content text,
    priority integer
);


--
-- Name: TABLE mpbc_development_plan; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_development_plan IS 'Player development plans with objectives and tracking';


--
-- Name: mpbc_development_plan_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_development_plan_assessments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    development_plan_id uuid,
    mp_core_benchmark_assessment_id uuid,
    assessment_date timestamp with time zone,
    video_evidence_url text,
    context_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_development_plan_assessments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_development_plan_assessments IS 'Assessments linked to player development plans';


--
-- Name: mpbc_development_plan_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_development_plan_progress (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    development_plan_id uuid,
    skill_tag_id uuid,
    assessment_date timestamp with time zone,
    previous_level text,
    current_level text,
    improvement_notes text,
    evidence text,
    next_steps text,
    assessed_by uuid,
    assessment_method text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: mpbc_drill_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_drill_master (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text,
    description text,
    category text,
    subcategory text,
    setup_instructions text,
    coaching_points text,
    equipment_needed text,
    space_requirements text,
    min_players integer,
    max_players integer,
    optimal_players integer,
    duration_minutes integer,
    difficulty_level text,
    age_appropriate text,
    skill_tags text[],
    phase_tags text[],
    video_url text,
    diagram_url text,
    pdf_url text,
    tags text[],
    verified boolean,
    usage_count integer,
    rating_avg double precision,
    active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid
);


--
-- Name: TABLE mpbc_drill_master; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_drill_master IS 'Master list of basketball drills';


--
-- Name: mpbc_drill_org; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_drill_org (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    organization_id uuid,
    master_drill_id uuid,
    name text,
    description text,
    customizations jsonb,
    private boolean,
    active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid
);


--
-- Name: TABLE mpbc_drill_org; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_drill_org IS 'Organization-specific drill configurations';


--
-- Name: mpbc_drill_phase_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_drill_phase_tags (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    drill_id uuid,
    phase_id uuid,
    relevance_level integer
);


--
-- Name: mpbc_drill_skill_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_drill_skill_tags (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    drill_id uuid,
    skill_tag_id uuid,
    emphasis_level integer
);


--
-- Name: mpbc_goal_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_goal_tracking (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    person_id uuid,
    development_plan_id uuid,
    group_id uuid,
    season_id uuid,
    goal_type text,
    title text,
    description text,
    target_metric text,
    target_value text,
    current_value text,
    deadline timestamp with time zone,
    priority text,
    status text,
    progress_notes text,
    last_updated timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid
);


--
-- Name: TABLE mpbc_goal_tracking; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_goal_tracking IS 'Player goal tracking and progress metrics';


--
-- Name: mpbc_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_group (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    mp_core_group_id uuid,
    division text,
    conference text,
    playing_style text,
    team_philosophy text,
    season_record text,
    team_statistics jsonb,
    home_court text,
    practice_facility text,
    equipment_inventory jsonb,
    travel_requirements text,
    collective_skill_level text,
    team_chemistry_rating integer,
    leadership_structure jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    name text,
    group_type text,
    lead_person_id uuid,
    program text,
    level_category text,
    description text,
    max_capacity integer,
    schedule jsonb,
    metadata jsonb,
    active boolean,
    created_by uuid,
    updated_by uuid
);


--
-- Name: TABLE mpbc_group; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_group IS 'Basketball-specific group/team data extending mp_core_group';


--
-- Name: mpbc_group_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_group_metadata (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    mp_core_group_id uuid,
    collective_growth_phase text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_group_metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_group_metadata IS 'Additional metadata for basketball teams/groups';


--
-- Name: mpbc_group_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_group_profile (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    mpbc_group_id uuid,
    collective_advancement_level text,
    collective_responsibility_tier text,
    collective_growth_phase text,
    offensive_rating integer,
    defensive_rating integer,
    pace_of_play integer,
    team_efficiency integer,
    strengths text[],
    areas_for_improvement text[],
    team_goals text,
    problem_solving_effectiveness integer,
    adaptability_rating integer,
    communication_effectiveness integer,
    performance_trends jsonb,
    milestone_achievements text[],
    last_team_assessment_date timestamp with time zone,
    assessment_notes text,
    next_development_targets text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_group_profile; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_group_profile IS 'Profile information for basketball teams/groups';


--
-- Name: mpbc_individual_challenge_points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_individual_challenge_points (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    mp_core_person_id uuid,
    cla_category_id uuid,
    current_challenge_level integer,
    optimal_challenge_level integer,
    success_rate double precision,
    last_calculated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_individual_challenge_points; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_individual_challenge_points IS 'Individual player challenge points';


--
-- Name: mpbc_message_threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_message_threads (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text,
    type text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT mpbc_message_threads_type_check CHECK ((type = ANY (ARRAY['direct'::text, 'group'::text, 'team'::text, 'announcement'::text])))
);


--
-- Name: mpbc_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_messages (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    thread_id uuid,
    sender_id uuid,
    content text,
    attachments jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: mpbc_observations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_observations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    player_id uuid,
    observer_id uuid,
    skill_tags text[],
    cla_category text,
    context text,
    observation_text text,
    performance_rating integer,
    basketball_specific_metrics jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    development_plan_id uuid,
    archived_at timestamp with time zone,
    archived_by uuid,
    organization_id uuid,
    group_id uuid,
    cycle_id uuid,
    tags text[],
    observation_date timestamp with time zone,
    updated_by uuid
);


--
-- Name: TABLE mpbc_observations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_observations IS 'Observations of players linked to development plans';


--
-- Name: mpbc_organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_organizations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text,
    created_at timestamp with time zone DEFAULT now(),
    type text,
    description text,
    logo_url text,
    contact_info jsonb,
    settings jsonb,
    subscription_tier text,
    overlay_version text,
    active boolean,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_organizations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_organizations IS 'Basketball-specific organization data';


--
-- Name: mpbc_outcome; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_outcome (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text,
    description text,
    theme_id uuid,
    phase_id uuid,
    measurement_type text,
    success_criteria text,
    active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_outcome; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_outcome IS 'Outcome definitions for development plans';


--
-- Name: mpbc_performance_indicators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_performance_indicators (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    cla_benchmark_id uuid,
    level text,
    description text,
    mp_core_benchmark_standard_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_performance_indicators; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_performance_indicators IS 'Key performance indicators for player evaluation';


--
-- Name: mpbc_performance_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_performance_metrics (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    entity_type text,
    entity_id uuid,
    metric_type text,
    metric_value double precision,
    metric_date timestamp with time zone,
    season_id uuid,
    calculation_method text,
    data_points integer,
    confidence_score double precision,
    notes text,
    calculated_at timestamp with time zone
);


--
-- Name: mpbc_person; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_person (
    id uuid NOT NULL,
    mp_core_person_id uuid NOT NULL,
    basketball_advancement_level text,
    basketball_responsibility_tier text,
    basketball_collective_phase text,
    "position" text,
    jersey_number text,
    height text,
    skill_ratings jsonb,
    strengths text[],
    areas_for_improvement text[],
    previous_advancement_level text,
    last_advancement_date timestamp with time zone,
    advancement_evidence text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    metadata jsonb,
    first_name text,
    last_name text,
    email text,
    phone text,
    notes text,
    person_type text,
    organization_id uuid,
    active boolean,
    date_of_birth timestamp with time zone,
    emergency_contact jsonb,
    profile_image_url text,
    medical_info jsonb,
    parent_guardian_info jsonb,
    created_by uuid,
    updated_by uuid,
    basketball_profile jsonb,
    business_profile jsonb,
    education_profile jsonb,
    auth_id uuid
);


--
-- Name: TABLE mpbc_person; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_person IS 'Knowledge database person table with basketball-specific profile data';


--
-- Name: mpbc_person_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_person_group (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    person_id uuid,
    group_id uuid,
    role text,
    organization_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    cycle_id uuid,
    "position" text,
    identifier text,
    status text,
    metadata jsonb,
    joined_at timestamp with time zone,
    left_at timestamp with time zone,
    created_by uuid
);


--
-- Name: TABLE mpbc_person_group; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_person_group IS 'Basketball-specific person-group membership data';


--
-- Name: mpbc_person_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_person_metadata (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    mp_core_person_id uuid,
    advancement_level text,
    responsibility_tier text,
    basketball_profile jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_person_metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_person_metadata IS 'Additional metadata for basketball players';


--
-- Name: mpbc_person_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_person_profile (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    mp_core_person_id uuid,
    age_band_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    advancement_level text,
    responsibility_tier text,
    basketball_profile jsonb
);


--
-- Name: TABLE mpbc_person_profile; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_person_profile IS 'Profile information for basketball players';


--
-- Name: mpbc_person_relationships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_person_relationships (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    person_id uuid,
    related_person_id uuid,
    relationship_type text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: mpbc_person_role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_person_role (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    person_id uuid,
    organization_id uuid,
    role text NOT NULL,
    permissions text[] DEFAULT '{}'::text[],
    scope_type text,
    scope_ids uuid[],
    active boolean DEFAULT true,
    started_at timestamp with time zone DEFAULT now(),
    ended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- Name: mpbc_phase; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_phase (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text,
    description text,
    pillar_id uuid,
    key_concepts text,
    order_index integer,
    active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_phase; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_phase IS 'Development phases for basketball players';


--
-- Name: mpbc_pillar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_pillar (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text,
    description text,
    focus_area text,
    key_principles text,
    desired_outcomes text,
    order_index integer,
    active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE mpbc_pillar; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_pillar IS 'Fundamental pillars of basketball development';


--
-- Name: mpbc_player_skill_challenge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_player_skill_challenge (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    development_plan_id uuid,
    skill_tag_id uuid,
    challenge_title text,
    description text,
    success_criteria text,
    practice_frequency text,
    deadline timestamp with time zone,
    priority text,
    difficulty text,
    status text,
    progress_percentage integer,
    coach_notes text,
    player_notes text,
    resources jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    player_id uuid
);


--
-- Name: TABLE mpbc_player_skill_challenge; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_player_skill_challenge IS 'Skill challenges for player development';


--
-- Name: mpbc_practice_block; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_practice_block (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    session_id uuid,
    master_drill_id uuid,
    org_drill_id uuid,
    block_name text,
    description text,
    phase_id uuid,
    theme_id uuid,
    objective text,
    duration_minutes integer,
    order_index integer,
    format text,
    constraints jsonb,
    coaching_emphasis text,
    success_criteria text,
    modifications text,
    equipment_needed text,
    space_setup text,
    player_groupings jsonb,
    notes text,
    completed boolean,
    effectiveness_rating integer,
    active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    cla_intelligence_targets jsonb,
    context_complexity_level integer,
    assessment_opportunities text
);


--
-- Name: TABLE mpbc_practice_block; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_practice_block IS 'Practice blocks for session planning';


--
-- Name: mpbc_practice_block_cla_constraints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_practice_block_cla_constraints (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    practice_block_id uuid,
    constraint_manipulation_id uuid,
    application_notes text,
    effectiveness_rating integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: mpbc_practice_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_practice_session (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    team_id uuid,
    season_id uuid,
    session_number integer,
    date timestamp with time zone,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    location text,
    facility_info text,
    primary_theme_id uuid,
    secondary_theme_id uuid,
    session_objective text,
    pre_practice_notes text,
    post_practice_notes text,
    coach_reflection text,
    intensity_level integer,
    status text,
    expected_attendance integer,
    actual_attendance integer,
    weather_conditions text,
    equipment_issues text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid
);


--
-- Name: TABLE mpbc_practice_session; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mpbc_practice_session IS 'Practice session planning and management';


--
-- Name: mpbc_practice_templates_enhanced; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_practice_templates_enhanced (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    template_id text,
    base_practice_number integer,
    attendance_min integer,
    attendance_max integer,
    intensity_level integer,
    focus_area text,
    template_blocks jsonb,
    estimated_duration integer,
    mpbc_alignment jsonb,
    constraint_density double precision,
    attendance_adaptations jsonb,
    variability_factors jsonb,
    cla_enhanced boolean,
    effectiveness_score double precision,
    usage_count integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: mpbc_practice_theme; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_practice_theme (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text,
    description text,
    category text,
    subcategory text,
    phase_id text,
    pillar_id text,
    combo_code bigint,
    synonyms jsonb,
    use_case text,
    verified boolean,
    active boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    suggested_by text,
    source_uid text
);


--
-- Name: mpbc_prompt_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_prompt_templates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    prompt_name text NOT NULL,
    use_case text NOT NULL,
    prompt_template text NOT NULL,
    system_instructions text,
    example_inputs jsonb,
    example_outputs jsonb,
    model_parameters jsonb,
    version text DEFAULT 'v1.0'::text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: mpbc_season; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_season (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    organization_id uuid NOT NULL,
    name text NOT NULL,
    year integer NOT NULL,
    term text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    description text,
    goals text[],
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    CONSTRAINT season_check CHECK ((end_date > start_date)),
    CONSTRAINT season_term_check CHECK ((term = ANY (ARRAY['fall'::text, 'winter'::text, 'spring'::text, 'summer'::text, 'annual'::text])))
);


--
-- Name: mpbc_session_participation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_session_participation (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    session_id uuid NOT NULL,
    player_id uuid NOT NULL,
    blocks_participated uuid[],
    leadership_displayed text[],
    effort_level integer,
    attitude_rating integer,
    skill_demonstration text[],
    areas_struggled text[],
    coach_feedback text,
    player_self_assessment text,
    created_at timestamp with time zone DEFAULT now(),
    recorded_by uuid,
    CONSTRAINT session_participation_attitude_rating_check CHECK (((attitude_rating >= 1) AND (attitude_rating <= 5))),
    CONSTRAINT session_participation_effort_level_check CHECK (((effort_level >= 1) AND (effort_level <= 5)))
);


--
-- Name: mpbc_signal_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_signal_type (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    signal_name text NOT NULL,
    description text,
    category text,
    trigger_conditions jsonb,
    recommended_actions text[],
    priority_level integer DEFAULT 3,
    auto_generate boolean DEFAULT false,
    prompt_template text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: mpbc_skill_prerequisites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_skill_prerequisites (
    skill_id text,
    prerequisite_skill_id text,
    required boolean,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: mpbc_skill_tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_skill_tag (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text,
    description text,
    category text,
    difficulty_level bigint,
    prerequisites text,
    pillar_id text,
    parent_skill_id text,
    progression_order bigint,
    active boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    cla_category_mapping text,
    intelligence_focus text,
    context_requirements text
);


--
-- Name: mpbc_template_usage_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_template_usage_log (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    template_id uuid,
    session_id uuid,
    organization_id uuid,
    coach_id uuid,
    attendance_actual integer,
    effectiveness_rating integer,
    modifications_made jsonb,
    coach_feedback text,
    would_use_again boolean,
    used_at timestamp with time zone DEFAULT now()
);


--
-- Name: mpbc_thread_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_thread_participants (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    thread_id uuid,
    user_id uuid,
    role text,
    joined_at timestamp with time zone DEFAULT now()
);


--
-- Name: mpbc_version_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mpbc_version_config (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    version text NOT NULL,
    schema_version text NOT NULL,
    prompt_library jsonb,
    constraint_definitions jsonb,
    ai_model_config jsonb,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: session_participation_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.session_participation_summary WITH (security_invoker='on') AS
 SELECT s.id AS session_id,
    s.date,
    s.session_type,
    g.name AS group_name,
    count(pl.id) AS total_tracked,
    count(
        CASE
            WHEN (pl.status = 'present'::text) THEN 1
            ELSE NULL::integer
        END) AS present_count,
    count(
        CASE
            WHEN (pl.status = 'absent'::text) THEN 1
            ELSE NULL::integer
        END) AS absent_count,
    count(
        CASE
            WHEN (pl.status = 'late'::text) THEN 1
            ELSE NULL::integer
        END) AS late_count,
    round((((count(
        CASE
            WHEN (pl.status = 'present'::text) THEN 1
            ELSE NULL::integer
        END))::numeric / (NULLIF(count(pl.id), 0))::numeric) * (100)::numeric), 2) AS attendance_percentage
   FROM ((public.infrastructure_sessions s
     JOIN public.mp_core_group g ON ((g.id = s.group_id)))
     LEFT JOIN public.infrastructure_participation_log pl ON ((pl.session_id = s.id)))
  GROUP BY s.id, s.date, s.session_type, g.name;


--
-- Name: v_mp_core_group_membership; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_mp_core_group_membership AS
 SELECT mp_core_person_group.id,
    mp_core_person_group.group_id,
    mp_core_person_group.person_id,
    mp_core_person_group.role,
    mp_core_person_group.created_at,
    mp_core_person_group.updated_at
   FROM public.mp_core_person_group;


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: infrastructure_dashboard_config dashboard_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_dashboard_config
    ADD CONSTRAINT dashboard_config_pkey PRIMARY KEY (id);


--
-- Name: infrastructure_file_storage file_storage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_file_storage
    ADD CONSTRAINT file_storage_pkey PRIMARY KEY (id);


--
-- Name: infrastructure_activity_logs infrastructure_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_activity_logs
    ADD CONSTRAINT infrastructure_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: infrastructure_invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: infrastructure_invites invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_invites
    ADD CONSTRAINT invites_pkey PRIMARY KEY (id);


--
-- Name: infrastructure_memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: mp_core_actions mp_core_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_actions
    ADD CONSTRAINT mp_core_actions_pkey PRIMARY KEY (id);


--
-- Name: mp_core_intentions mp_core_intentions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_intentions
    ADD CONSTRAINT mp_core_intentions_pkey PRIMARY KEY (id);


--
-- Name: mp_core_person mp_core_person_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person
    ADD CONSTRAINT mp_core_person_pkey PRIMARY KEY (id);


--
-- Name: mp_core_person mp_core_person_stripe_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person
    ADD CONSTRAINT mp_core_person_stripe_customer_id_key UNIQUE (stripe_customer_id);


--
-- Name: mp_core_person mp_core_person_stripe_customer_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person
    ADD CONSTRAINT mp_core_person_stripe_customer_id_unique UNIQUE (stripe_customer_id);


--
-- Name: mp_core_person mp_core_person_stripe_subscription_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person
    ADD CONSTRAINT mp_core_person_stripe_subscription_id_key UNIQUE (stripe_subscription_id);


--
-- Name: mp_core_person mp_core_person_stripe_subscription_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person
    ADD CONSTRAINT mp_core_person_stripe_subscription_id_unique UNIQUE (stripe_subscription_id);


--
-- Name: mp_core_reflections mp_core_reflections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_reflections
    ADD CONSTRAINT mp_core_reflections_pkey PRIMARY KEY (id);


--
-- Name: mp_core_group mp_core_team_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_group
    ADD CONSTRAINT mp_core_team_pkey PRIMARY KEY (id);


--
-- Name: mp_philosophy_arc_advancement mp_philosophy_arc_advancement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_philosophy_arc_advancement
    ADD CONSTRAINT mp_philosophy_arc_advancement_pkey PRIMARY KEY (id);


--
-- Name: mp_philosophy_arc_collective mp_philosophy_arc_collective_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_philosophy_arc_collective
    ADD CONSTRAINT mp_philosophy_arc_collective_pkey PRIMARY KEY (id);


--
-- Name: mp_philosophy_arc_responsibility mp_philosophy_arc_responsibility_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_philosophy_arc_responsibility
    ADD CONSTRAINT mp_philosophy_arc_responsibility_pkey PRIMARY KEY (id);


--
-- Name: mp_philosophy_arc_types mp_philosophy_arc_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_philosophy_arc_types
    ADD CONSTRAINT mp_philosophy_arc_types_name_key UNIQUE (name);


--
-- Name: mp_philosophy_arc_types mp_philosophy_arc_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_philosophy_arc_types
    ADD CONSTRAINT mp_philosophy_arc_types_pkey PRIMARY KEY (id);


--
-- Name: mp_philosophy_benchmark_framework mp_philosophy_benchmark_framework_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_philosophy_benchmark_framework
    ADD CONSTRAINT mp_philosophy_benchmark_framework_name_key UNIQUE (name);


--
-- Name: mp_philosophy_benchmark_framework mp_philosophy_benchmark_framework_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_philosophy_benchmark_framework
    ADD CONSTRAINT mp_philosophy_benchmark_framework_pkey PRIMARY KEY (id);


--
-- Name: mp_philosophy_challenge_point mp_philosophy_challenge_point_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_philosophy_challenge_point
    ADD CONSTRAINT mp_philosophy_challenge_point_pkey PRIMARY KEY (id);


--
-- Name: mpbc_age_bands mpbc_age_bands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_age_bands
    ADD CONSTRAINT mpbc_age_bands_pkey PRIMARY KEY (id);


--
-- Name: mpbc_audit_log mpbc_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_audit_log
    ADD CONSTRAINT mpbc_audit_log_pkey PRIMARY KEY (id);


--
-- Name: mpbc_benchmark_constraints mpbc_benchmark_constraints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_benchmark_constraints
    ADD CONSTRAINT mpbc_benchmark_constraints_pkey PRIMARY KEY (id);


--
-- Name: mpbc_block_player_assignment mpbc_block_player_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_block_player_assignment
    ADD CONSTRAINT mpbc_block_player_assignment_pkey PRIMARY KEY (id);


--
-- Name: mpbc_cla_benchmarks mpbc_cla_benchmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_cla_benchmarks
    ADD CONSTRAINT mpbc_cla_benchmarks_pkey PRIMARY KEY (id);


--
-- Name: mpbc_cla_categories mpbc_cla_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_cla_categories
    ADD CONSTRAINT mpbc_cla_categories_pkey PRIMARY KEY (id);


--
-- Name: mpbc_coach_template_preferences mpbc_coach_template_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_coach_template_preferences
    ADD CONSTRAINT mpbc_coach_template_preferences_pkey PRIMARY KEY (id);


--
-- Name: mpbc_constraint_manipulations mpbc_constraint_manipulations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_constraint_manipulations
    ADD CONSTRAINT mpbc_constraint_manipulations_pkey PRIMARY KEY (id);


--
-- Name: mpbc_constraint_type mpbc_constraint_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_constraint_type
    ADD CONSTRAINT mpbc_constraint_type_pkey PRIMARY KEY (id);


--
-- Name: mpbc_constraints_bank mpbc_constraints_bank_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_constraints_bank
    ADD CONSTRAINT mpbc_constraints_bank_pkey PRIMARY KEY (id);


--
-- Name: mpbc_core_person_profile mpbc_core_person_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_core_person_profile
    ADD CONSTRAINT mpbc_core_person_profile_pkey PRIMARY KEY (person_id);


--
-- Name: mpbc_core_skill_mapping mpbc_core_skill_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_core_skill_mapping
    ADD CONSTRAINT mpbc_core_skill_mapping_pkey PRIMARY KEY (id);


--
-- Name: mpbc_core_skills mpbc_core_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_core_skills
    ADD CONSTRAINT mpbc_core_skills_pkey PRIMARY KEY (id);


--
-- Name: mpbc_cue_pack mpbc_cue_pack_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_cue_pack
    ADD CONSTRAINT mpbc_cue_pack_pkey PRIMARY KEY (id);


--
-- Name: mpbc_development_plan_assessments mpbc_development_plan_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_development_plan_assessments
    ADD CONSTRAINT mpbc_development_plan_assessments_pkey PRIMARY KEY (id);


--
-- Name: mpbc_development_plan mpbc_development_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_development_plan
    ADD CONSTRAINT mpbc_development_plan_pkey PRIMARY KEY (id);


--
-- Name: mpbc_development_plan_progress mpbc_development_plan_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_development_plan_progress
    ADD CONSTRAINT mpbc_development_plan_progress_pkey PRIMARY KEY (id);


--
-- Name: mpbc_drill_master mpbc_drill_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_drill_master
    ADD CONSTRAINT mpbc_drill_master_pkey PRIMARY KEY (id);


--
-- Name: mpbc_drill_org mpbc_drill_org_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_drill_org
    ADD CONSTRAINT mpbc_drill_org_pkey PRIMARY KEY (id);


--
-- Name: mpbc_drill_phase_tags mpbc_drill_phase_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_drill_phase_tags
    ADD CONSTRAINT mpbc_drill_phase_tags_pkey PRIMARY KEY (id);


--
-- Name: mpbc_drill_skill_tags mpbc_drill_skill_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_drill_skill_tags
    ADD CONSTRAINT mpbc_drill_skill_tags_pkey PRIMARY KEY (id);


--
-- Name: mpbc_goal_tracking mpbc_goal_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_goal_tracking
    ADD CONSTRAINT mpbc_goal_tracking_pkey PRIMARY KEY (id);


--
-- Name: mpbc_group_metadata mpbc_group_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_group_metadata
    ADD CONSTRAINT mpbc_group_metadata_pkey PRIMARY KEY (id);


--
-- Name: mpbc_group mpbc_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_group
    ADD CONSTRAINT mpbc_group_pkey PRIMARY KEY (id);


--
-- Name: mpbc_group_profile mpbc_group_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_group_profile
    ADD CONSTRAINT mpbc_group_profile_pkey PRIMARY KEY (id);


--
-- Name: mpbc_individual_challenge_points mpbc_individual_challenge_points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_individual_challenge_points
    ADD CONSTRAINT mpbc_individual_challenge_points_pkey PRIMARY KEY (id);


--
-- Name: mpbc_message_threads mpbc_message_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_message_threads
    ADD CONSTRAINT mpbc_message_threads_pkey PRIMARY KEY (id);


--
-- Name: mpbc_messages mpbc_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_messages
    ADD CONSTRAINT mpbc_messages_pkey PRIMARY KEY (id);


--
-- Name: mpbc_observations mpbc_observations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_observations
    ADD CONSTRAINT mpbc_observations_pkey PRIMARY KEY (id);


--
-- Name: mpbc_organizations mpbc_organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_organizations
    ADD CONSTRAINT mpbc_organizations_pkey PRIMARY KEY (id);


--
-- Name: mpbc_outcome mpbc_outcome_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_outcome
    ADD CONSTRAINT mpbc_outcome_pkey PRIMARY KEY (id);


--
-- Name: mpbc_performance_indicators mpbc_performance_indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_performance_indicators
    ADD CONSTRAINT mpbc_performance_indicators_pkey PRIMARY KEY (id);


--
-- Name: mpbc_performance_metrics mpbc_performance_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_performance_metrics
    ADD CONSTRAINT mpbc_performance_metrics_pkey PRIMARY KEY (id);


--
-- Name: mpbc_person_group mpbc_person_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_group
    ADD CONSTRAINT mpbc_person_group_pkey PRIMARY KEY (id);


--
-- Name: mpbc_person_metadata mpbc_person_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_metadata
    ADD CONSTRAINT mpbc_person_metadata_pkey PRIMARY KEY (id);


--
-- Name: mpbc_person mpbc_person_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person
    ADD CONSTRAINT mpbc_person_pkey PRIMARY KEY (id);


--
-- Name: mpbc_person_profile mpbc_person_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_profile
    ADD CONSTRAINT mpbc_person_profile_pkey PRIMARY KEY (id);


--
-- Name: mpbc_person_relationships mpbc_person_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_relationships
    ADD CONSTRAINT mpbc_person_relationships_pkey PRIMARY KEY (id);


--
-- Name: mpbc_person_role mpbc_person_role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_role
    ADD CONSTRAINT mpbc_person_role_pkey PRIMARY KEY (id);


--
-- Name: mpbc_phase mpbc_phase_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_phase
    ADD CONSTRAINT mpbc_phase_pkey PRIMARY KEY (id);


--
-- Name: mpbc_pillar mpbc_pillar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_pillar
    ADD CONSTRAINT mpbc_pillar_pkey PRIMARY KEY (id);


--
-- Name: mpbc_player_skill_challenge mpbc_player_skill_challenge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_player_skill_challenge
    ADD CONSTRAINT mpbc_player_skill_challenge_pkey PRIMARY KEY (id);


--
-- Name: mpbc_practice_block_cla_constraints mpbc_practice_block_cla_constraints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_practice_block_cla_constraints
    ADD CONSTRAINT mpbc_practice_block_cla_constraints_pkey PRIMARY KEY (id);


--
-- Name: mpbc_practice_block mpbc_practice_block_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_practice_block
    ADD CONSTRAINT mpbc_practice_block_pkey PRIMARY KEY (id);


--
-- Name: mpbc_practice_session mpbc_practice_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_practice_session
    ADD CONSTRAINT mpbc_practice_session_pkey PRIMARY KEY (id);


--
-- Name: mpbc_practice_templates_enhanced mpbc_practice_templates_enhanced_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_practice_templates_enhanced
    ADD CONSTRAINT mpbc_practice_templates_enhanced_pkey PRIMARY KEY (id);


--
-- Name: mpbc_practice_theme mpbc_practice_theme_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_practice_theme
    ADD CONSTRAINT mpbc_practice_theme_pkey PRIMARY KEY (id);


--
-- Name: mpbc_prompt_templates mpbc_prompt_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_prompt_templates
    ADD CONSTRAINT mpbc_prompt_templates_pkey PRIMARY KEY (id);


--
-- Name: mpbc_signal_type mpbc_signal_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_signal_type
    ADD CONSTRAINT mpbc_signal_type_pkey PRIMARY KEY (id);


--
-- Name: mpbc_skill_prerequisites mpbc_skill_prerequisites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_skill_prerequisites
    ADD CONSTRAINT mpbc_skill_prerequisites_pkey PRIMARY KEY (id);


--
-- Name: mpbc_skill_tag mpbc_skill_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_skill_tag
    ADD CONSTRAINT mpbc_skill_tag_pkey PRIMARY KEY (id);


--
-- Name: mpbc_thread_participants mpbc_thread_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_thread_participants
    ADD CONSTRAINT mpbc_thread_participants_pkey PRIMARY KEY (id);


--
-- Name: mpbc_version_config mpbc_version_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_version_config
    ADD CONSTRAINT mpbc_version_config_pkey PRIMARY KEY (id);


--
-- Name: infrastructure_notification_queue notification_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_notification_queue
    ADD CONSTRAINT notification_queue_pkey PRIMARY KEY (id);


--
-- Name: mp_core_organizations orgs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_organizations
    ADD CONSTRAINT orgs_pkey PRIMARY KEY (id);


--
-- Name: infrastructure_participation_log participation_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_participation_log
    ADD CONSTRAINT participation_log_pkey PRIMARY KEY (id);


--
-- Name: mp_core_person_group person_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_group
    ADD CONSTRAINT person_group_pkey PRIMARY KEY (id);


--
-- Name: mp_core_person_role person_role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_role
    ADD CONSTRAINT person_role_pkey PRIMARY KEY (id);


--
-- Name: infrastructure_program_cycle program_cycle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_program_cycle
    ADD CONSTRAINT program_cycle_pkey PRIMARY KEY (id);


--
-- Name: mpbc_season season_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_season
    ADD CONSTRAINT season_pkey PRIMARY KEY (id);


--
-- Name: mpbc_session_participation session_participation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_session_participation
    ADD CONSTRAINT session_participation_pkey PRIMARY KEY (id);


--
-- Name: mpbc_session_participation session_participation_session_id_player_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_session_participation
    ADD CONSTRAINT session_participation_session_id_player_id_key UNIQUE (session_id, player_id);


--
-- Name: infrastructure_sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: infrastructure_system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: mpbc_template_usage_log template_usage_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_template_usage_log
    ADD CONSTRAINT template_usage_log_pkey PRIMARY KEY (id);


--
-- Name: mpbc_season unique_active_season; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_season
    ADD CONSTRAINT unique_active_season UNIQUE (organization_id, active) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_dashboard_config_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dashboard_config_organization_id ON public.infrastructure_dashboard_config USING btree (organization_id);


--
-- Name: idx_dashboard_config_person_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dashboard_config_person_id ON public.infrastructure_dashboard_config USING btree (person_id);


--
-- Name: idx_file_storage_entity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_file_storage_entity_id ON public.infrastructure_file_storage USING btree (entity_id);


--
-- Name: idx_file_storage_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_file_storage_organization_id ON public.infrastructure_file_storage USING btree (organization_id);


--
-- Name: idx_mp_core_person_auth_uid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mp_core_person_auth_uid ON public.mp_core_person USING btree (auth_uid);


--
-- Name: idx_mp_core_person_group_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mp_core_person_group_group_id ON public.mp_core_person_group USING btree (group_id);


--
-- Name: idx_mp_core_person_group_person_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mp_core_person_group_person_id ON public.mp_core_person_group USING btree (person_id);


--
-- Name: idx_mp_core_person_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mp_core_person_organization_id ON public.mp_core_person USING btree (organization_id);


--
-- Name: idx_mpbc_core_person_profile_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mpbc_core_person_profile_org_id ON public.mpbc_core_person_profile USING btree (organization_id);


--
-- Name: idx_mpbc_development_plan_archived_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mpbc_development_plan_archived_at ON public.mpbc_development_plan USING btree (archived_at);


--
-- Name: idx_mpbc_development_plan_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mpbc_development_plan_organization_id ON public.mpbc_development_plan USING btree (organization_id);


--
-- Name: idx_mpbc_development_plan_person_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mpbc_development_plan_person_id ON public.mpbc_development_plan USING btree (person_id);


--
-- Name: idx_mpbc_group_mp_core_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mpbc_group_mp_core_group_id ON public.mpbc_group USING btree (mp_core_group_id);


--
-- Name: idx_mpbc_observations_archived_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mpbc_observations_archived_at ON public.mpbc_observations USING btree (archived_at);


--
-- Name: idx_mpbc_observations_development_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mpbc_observations_development_plan_id ON public.mpbc_observations USING btree (development_plan_id);


--
-- Name: idx_mpbc_person_group_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mpbc_person_group_group_id ON public.mpbc_person_group USING btree (group_id);


--
-- Name: idx_mpbc_person_group_person_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mpbc_person_group_person_id ON public.mpbc_person_group USING btree (person_id);


--
-- Name: idx_mpbc_person_mp_core_person_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mpbc_person_mp_core_person_id ON public.mpbc_person USING btree (mp_core_person_id);


--
-- Name: idx_mpbc_person_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mpbc_person_organization_id ON public.mpbc_person USING btree (organization_id);


--
-- Name: idx_notification_queue_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_queue_organization_id ON public.infrastructure_notification_queue USING btree (organization_id);


--
-- Name: idx_notification_queue_recipient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_queue_recipient_id ON public.infrastructure_notification_queue USING btree (recipient_id);


--
-- Name: idx_orgs_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orgs_id ON public.mp_core_organizations USING btree (id);


--
-- Name: idx_participation_log_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_participation_log_organization_id ON public.infrastructure_participation_log USING btree (organization_id);


--
-- Name: idx_participation_log_person_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_participation_log_person_id ON public.infrastructure_participation_log USING btree (person_id);


--
-- Name: idx_participation_log_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_participation_log_session_id ON public.infrastructure_participation_log USING btree (session_id);


--
-- Name: idx_person_group_cycle_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_person_group_cycle_id ON public.mp_core_person_group USING btree (cycle_id);


--
-- Name: idx_person_group_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_person_group_group_id ON public.mp_core_person_group USING btree (group_id);


--
-- Name: idx_person_group_person_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_person_group_person_id ON public.mp_core_person_group USING btree (person_id);


--
-- Name: idx_person_role_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_person_role_organization_id ON public.mp_core_person_role USING btree (organization_id);


--
-- Name: idx_person_role_person_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_person_role_person_id ON public.mp_core_person_role USING btree (person_id);


--
-- Name: idx_season_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_season_dates ON public.mpbc_season USING btree (start_date, end_date);


--
-- Name: idx_season_organization_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_season_organization_active ON public.mpbc_season USING btree (organization_id, active);


--
-- Name: idx_sessions_cycle_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_cycle_id ON public.infrastructure_sessions USING btree (cycle_id);


--
-- Name: idx_sessions_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_group_id ON public.infrastructure_sessions USING btree (group_id);


--
-- Name: idx_sessions_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_organization_id ON public.infrastructure_sessions USING btree (organization_id);


--
-- Name: idx_system_settings_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_settings_organization_id ON public.infrastructure_system_settings USING btree (organization_id);


--
-- Name: mpbc_person_role_organization_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mpbc_person_role_organization_id_idx ON public.mpbc_person_role USING btree (organization_id);


--
-- Name: mpbc_person_role_person_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mpbc_person_role_person_id_idx ON public.mpbc_person_role USING btree (person_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: users on_signup; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: mpbc_age_bands set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_age_bands FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_cla_benchmarks set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_cla_benchmarks FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_cla_categories set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_cla_categories FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_coach_template_preferences set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_coach_template_preferences FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_constraint_manipulations set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_constraint_manipulations FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_core_skills set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_core_skills FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_development_plan set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_development_plan FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_development_plan_assessments set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_development_plan_assessments FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_drill_master set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_drill_master FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_drill_org set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_drill_org FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_goal_tracking set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_goal_tracking FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_group set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_group FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_group_metadata set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_group_metadata FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_group_profile set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_group_profile FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_individual_challenge_points set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_individual_challenge_points FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_observations set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_observations FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_organizations set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_organizations FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_outcome set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_outcome FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_performance_indicators set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_performance_indicators FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_person set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_person FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_person_metadata set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_person_metadata FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_person_profile set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_person_profile FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_phase set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_phase FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_pillar set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_pillar FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_player_skill_challenge set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_player_skill_challenge FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_practice_block set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_practice_block FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: mpbc_practice_session set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mpbc_practice_session FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: infrastructure_dashboard_config trigger_update_dashboard_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_dashboard_config_updated_at BEFORE UPDATE ON public.infrastructure_dashboard_config FOR EACH ROW EXECUTE FUNCTION public.update_dashboard_config_updated_at();


--
-- Name: mp_core_organizations trigger_update_organization_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_organization_updated_at BEFORE UPDATE ON public.mp_core_organizations FOR EACH ROW EXECUTE FUNCTION public.update_organization_updated_at();


--
-- Name: infrastructure_sessions trigger_update_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_sessions_updated_at BEFORE UPDATE ON public.infrastructure_sessions FOR EACH ROW EXECUTE FUNCTION public.update_sessions_updated_at();


--
-- Name: infrastructure_system_settings trigger_update_system_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_system_settings_updated_at BEFORE UPDATE ON public.infrastructure_system_settings FOR EACH ROW EXECUTE FUNCTION public.update_system_settings_updated_at();


--
-- Name: mpbc_season update_season_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_season_updated_at BEFORE UPDATE ON public.mpbc_season FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: infrastructure_dashboard_config dashboard_config_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_dashboard_config
    ADD CONSTRAINT dashboard_config_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: infrastructure_file_storage file_storage_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_file_storage
    ADD CONSTRAINT file_storage_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: mp_core_actions fk_actions_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_actions
    ADD CONSTRAINT fk_actions_group FOREIGN KEY (group_id) REFERENCES public.mp_core_group(id);


--
-- Name: mp_core_actions fk_actions_intention; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_actions
    ADD CONSTRAINT fk_actions_intention FOREIGN KEY (intention_id) REFERENCES public.mp_core_intentions(id);


--
-- Name: mp_core_actions fk_actions_person; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_actions
    ADD CONSTRAINT fk_actions_person FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_group fk_group_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_group
    ADD CONSTRAINT fk_group_created_by FOREIGN KEY (created_by) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_group fk_group_lead_person; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_group
    ADD CONSTRAINT fk_group_lead_person FOREIGN KEY (lead_person_id) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_group fk_group_organization; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_group
    ADD CONSTRAINT fk_group_organization FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: mp_core_group fk_group_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_group
    ADD CONSTRAINT fk_group_updated_by FOREIGN KEY (updated_by) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_intentions fk_intentions_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_intentions
    ADD CONSTRAINT fk_intentions_group FOREIGN KEY (group_id) REFERENCES public.mp_core_group(id);


--
-- Name: mp_core_intentions fk_intentions_person; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_intentions
    ADD CONSTRAINT fk_intentions_person FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id);


--
-- Name: mpbc_development_plan fk_mpbc_development_plan_person; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_development_plan
    ADD CONSTRAINT fk_mpbc_development_plan_person FOREIGN KEY (person_id) REFERENCES public.mpbc_person(id) ON DELETE SET NULL;


--
-- Name: mpbc_group fk_mpbc_group_mp_core_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_group
    ADD CONSTRAINT fk_mpbc_group_mp_core_group FOREIGN KEY (mp_core_group_id) REFERENCES public.mp_core_group(id) ON DELETE CASCADE;


--
-- Name: mpbc_observations fk_mpbc_observations_development_plan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_observations
    ADD CONSTRAINT fk_mpbc_observations_development_plan FOREIGN KEY (development_plan_id) REFERENCES public.mpbc_development_plan(id) ON DELETE SET NULL;


--
-- Name: mpbc_person fk_mpbc_person_mp_core_person; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person
    ADD CONSTRAINT fk_mpbc_person_mp_core_person FOREIGN KEY (mp_core_person_id) REFERENCES public.mp_core_person(id) ON DELETE CASCADE;


--
-- Name: mp_core_person fk_person_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person
    ADD CONSTRAINT fk_person_created_by FOREIGN KEY (created_by) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_person_group fk_person_group_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_group
    ADD CONSTRAINT fk_person_group_created_by FOREIGN KEY (created_by) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_person_group fk_person_group_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_group
    ADD CONSTRAINT fk_person_group_group FOREIGN KEY (group_id) REFERENCES public.mp_core_group(id);


--
-- Name: mp_core_person_group fk_person_group_organization; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_group
    ADD CONSTRAINT fk_person_group_organization FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: mp_core_person_group fk_person_group_payer; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_group
    ADD CONSTRAINT fk_person_group_payer FOREIGN KEY (payer_id) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_person_group fk_person_group_person; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_group
    ADD CONSTRAINT fk_person_group_person FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_person fk_person_organization; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person
    ADD CONSTRAINT fk_person_organization FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: mp_core_person_role fk_person_role_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_role
    ADD CONSTRAINT fk_person_role_created_by FOREIGN KEY (created_by) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_person_role fk_person_role_organization; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_role
    ADD CONSTRAINT fk_person_role_organization FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: mp_core_person_role fk_person_role_person; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_role
    ADD CONSTRAINT fk_person_role_person FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_person fk_person_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person
    ADD CONSTRAINT fk_person_updated_by FOREIGN KEY (updated_by) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_reflections fk_reflections_action; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_reflections
    ADD CONSTRAINT fk_reflections_action FOREIGN KEY (action_id) REFERENCES public.mp_core_actions(id);


--
-- Name: mp_core_reflections fk_reflections_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_reflections
    ADD CONSTRAINT fk_reflections_group FOREIGN KEY (group_id) REFERENCES public.mp_core_group(id);


--
-- Name: mp_core_reflections fk_reflections_intention; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_reflections
    ADD CONSTRAINT fk_reflections_intention FOREIGN KEY (intention_id) REFERENCES public.mp_core_intentions(id);


--
-- Name: mp_core_reflections fk_reflections_person; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_reflections
    ADD CONSTRAINT fk_reflections_person FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id);


--
-- Name: infrastructure_activity_logs infrastructure_activity_logs_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_activity_logs
    ADD CONSTRAINT infrastructure_activity_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: infrastructure_activity_logs infrastructure_activity_logs_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_activity_logs
    ADD CONSTRAINT infrastructure_activity_logs_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id);


--
-- Name: infrastructure_invitations infrastructure_invitations_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_invitations
    ADD CONSTRAINT infrastructure_invitations_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.mp_core_group(id);


--
-- Name: infrastructure_sessions infrastructure_sessions_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_sessions
    ADD CONSTRAINT infrastructure_sessions_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.mp_core_group(id);


--
-- Name: infrastructure_invites invites_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_invites
    ADD CONSTRAINT invites_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: infrastructure_memberships memberships_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_memberships
    ADD CONSTRAINT memberships_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: infrastructure_memberships memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_memberships
    ADD CONSTRAINT memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: mp_core_actions mp_core_actions_intention_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_actions
    ADD CONSTRAINT mp_core_actions_intention_id_fkey FOREIGN KEY (intention_id) REFERENCES public.mp_core_intentions(id);


--
-- Name: mp_core_actions mp_core_actions_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_actions
    ADD CONSTRAINT mp_core_actions_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id) ON DELETE CASCADE;


--
-- Name: mp_core_actions mp_core_actions_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_actions
    ADD CONSTRAINT mp_core_actions_team_id_fkey FOREIGN KEY (group_id) REFERENCES public.mp_core_group(id);


--
-- Name: mp_core_intentions mp_core_intentions_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_intentions
    ADD CONSTRAINT mp_core_intentions_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id) ON DELETE CASCADE;


--
-- Name: mp_core_intentions mp_core_intentions_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_intentions
    ADD CONSTRAINT mp_core_intentions_team_id_fkey FOREIGN KEY (group_id) REFERENCES public.mp_core_group(id);


--
-- Name: mp_core_person mp_core_person_auth_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person
    ADD CONSTRAINT mp_core_person_auth_uid_fkey FOREIGN KEY (auth_uid) REFERENCES auth.users(id);


--
-- Name: mp_core_person_group mp_core_person_group_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_group
    ADD CONSTRAINT mp_core_person_group_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.mp_core_group(id);


--
-- Name: mp_core_person_group mp_core_person_group_payer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_group
    ADD CONSTRAINT mp_core_person_group_payer_id_fkey FOREIGN KEY (payer_id) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_person_group mp_core_person_group_payer_id_mp_core_person_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_group
    ADD CONSTRAINT mp_core_person_group_payer_id_mp_core_person_id_fk FOREIGN KEY (payer_id) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_person_group mp_core_person_group_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_group
    ADD CONSTRAINT mp_core_person_group_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id);


--
-- Name: mp_core_reflections mp_core_reflections_action_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_reflections
    ADD CONSTRAINT mp_core_reflections_action_id_fkey FOREIGN KEY (action_id) REFERENCES public.mp_core_actions(id);


--
-- Name: mp_core_reflections mp_core_reflections_intention_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_reflections
    ADD CONSTRAINT mp_core_reflections_intention_id_fkey FOREIGN KEY (intention_id) REFERENCES public.mp_core_intentions(id);


--
-- Name: mp_core_reflections mp_core_reflections_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_reflections
    ADD CONSTRAINT mp_core_reflections_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id) ON DELETE CASCADE;


--
-- Name: mp_core_reflections mp_core_reflections_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_reflections
    ADD CONSTRAINT mp_core_reflections_team_id_fkey FOREIGN KEY (group_id) REFERENCES public.mp_core_group(id);


--
-- Name: mp_core_person_role mp_person_role_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_role
    ADD CONSTRAINT mp_person_role_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id);


--
-- Name: mpbc_core_person_profile mpbc_core_person_profile_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_core_person_profile
    ADD CONSTRAINT mpbc_core_person_profile_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: mpbc_core_person_profile mpbc_core_person_profile_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_core_person_profile
    ADD CONSTRAINT mpbc_core_person_profile_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id) ON DELETE CASCADE;


--
-- Name: mpbc_development_plan_assessments mpbc_development_plan_assessments_development_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_development_plan_assessments
    ADD CONSTRAINT mpbc_development_plan_assessments_development_plan_id_fkey FOREIGN KEY (development_plan_id) REFERENCES public.mpbc_development_plan(id);


--
-- Name: mpbc_development_plan mpbc_development_plan_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_development_plan
    ADD CONSTRAINT mpbc_development_plan_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.mp_core_group(id);


--
-- Name: mpbc_development_plan mpbc_development_plan_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_development_plan
    ADD CONSTRAINT mpbc_development_plan_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.mpbc_person(id);


--
-- Name: mpbc_development_plan_progress mpbc_development_plan_progress_development_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_development_plan_progress
    ADD CONSTRAINT mpbc_development_plan_progress_development_plan_id_fkey FOREIGN KEY (development_plan_id) REFERENCES public.mpbc_development_plan(id);


--
-- Name: mpbc_development_plan mpbc_development_plan_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_development_plan
    ADD CONSTRAINT mpbc_development_plan_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.mpbc_season(id);


--
-- Name: mpbc_goal_tracking mpbc_goal_tracking_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_goal_tracking
    ADD CONSTRAINT mpbc_goal_tracking_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.mpbc_group(id);


--
-- Name: mpbc_group mpbc_group_lead_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_group
    ADD CONSTRAINT mpbc_group_lead_person_id_fkey FOREIGN KEY (lead_person_id) REFERENCES public.mpbc_person(id);


--
-- Name: mpbc_message_threads mpbc_message_threads_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_message_threads
    ADD CONSTRAINT mpbc_message_threads_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: mpbc_messages mpbc_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_messages
    ADD CONSTRAINT mpbc_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id);


--
-- Name: mpbc_messages mpbc_messages_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_messages
    ADD CONSTRAINT mpbc_messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.mpbc_message_threads(id) ON DELETE CASCADE;


--
-- Name: mpbc_observations mpbc_observations_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_observations
    ADD CONSTRAINT mpbc_observations_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.mpbc_group(id);


--
-- Name: mpbc_observations mpbc_observations_observer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_observations
    ADD CONSTRAINT mpbc_observations_observer_id_fkey FOREIGN KEY (observer_id) REFERENCES public.mpbc_person(id);


--
-- Name: mpbc_observations mpbc_observations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_observations
    ADD CONSTRAINT mpbc_observations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mpbc_organizations(id);


--
-- Name: mpbc_observations mpbc_observations_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_observations
    ADD CONSTRAINT mpbc_observations_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.mpbc_person(id);


--
-- Name: mpbc_person mpbc_person_auth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person
    ADD CONSTRAINT mpbc_person_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id);


--
-- Name: mpbc_person_group mpbc_person_group_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_group
    ADD CONSTRAINT mpbc_person_group_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.mpbc_group(id);


--
-- Name: mpbc_person_group mpbc_person_group_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_group
    ADD CONSTRAINT mpbc_person_group_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mpbc_organizations(id);


--
-- Name: mpbc_person_group mpbc_person_group_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_group
    ADD CONSTRAINT mpbc_person_group_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.mpbc_person(id);


--
-- Name: mpbc_person mpbc_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person
    ADD CONSTRAINT mpbc_person_id_fkey FOREIGN KEY (id) REFERENCES public.mp_core_person(id);


--
-- Name: mpbc_person_relationships mpbc_person_relationships_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_relationships
    ADD CONSTRAINT mpbc_person_relationships_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.mpbc_person(id) ON DELETE CASCADE;


--
-- Name: mpbc_person_relationships mpbc_person_relationships_related_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_relationships
    ADD CONSTRAINT mpbc_person_relationships_related_person_id_fkey FOREIGN KEY (related_person_id) REFERENCES public.mpbc_person(id) ON DELETE CASCADE;


--
-- Name: mpbc_person_role mpbc_person_role_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_role
    ADD CONSTRAINT mpbc_person_role_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.mp_core_person(id);


--
-- Name: mpbc_person_role mpbc_person_role_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_role
    ADD CONSTRAINT mpbc_person_role_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: mpbc_person_role mpbc_person_role_organization_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_role
    ADD CONSTRAINT mpbc_person_role_organization_id_fkey1 FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: mpbc_person_role mpbc_person_role_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_role
    ADD CONSTRAINT mpbc_person_role_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id);


--
-- Name: mpbc_person_role mpbc_person_role_person_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_person_role
    ADD CONSTRAINT mpbc_person_role_person_id_fkey1 FOREIGN KEY (person_id) REFERENCES public.mp_core_person(id);


--
-- Name: mpbc_player_skill_challenge mpbc_player_skill_challenge_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_player_skill_challenge
    ADD CONSTRAINT mpbc_player_skill_challenge_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.mpbc_person(id);


--
-- Name: mpbc_player_skill_challenge mpbc_player_skill_challenge_development_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_player_skill_challenge
    ADD CONSTRAINT mpbc_player_skill_challenge_development_plan_id_fkey FOREIGN KEY (development_plan_id) REFERENCES public.mpbc_development_plan(id);


--
-- Name: mpbc_player_skill_challenge mpbc_player_skill_challenge_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_player_skill_challenge
    ADD CONSTRAINT mpbc_player_skill_challenge_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.mpbc_person(id);


--
-- Name: mpbc_player_skill_challenge mpbc_player_skill_challenge_skill_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_player_skill_challenge
    ADD CONSTRAINT mpbc_player_skill_challenge_skill_tag_id_fkey FOREIGN KEY (skill_tag_id) REFERENCES public.mpbc_skill_tag(id);


--
-- Name: mpbc_player_skill_challenge mpbc_player_skill_challenge_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_player_skill_challenge
    ADD CONSTRAINT mpbc_player_skill_challenge_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.mpbc_person(id);


--
-- Name: mpbc_thread_participants mpbc_thread_participants_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_thread_participants
    ADD CONSTRAINT mpbc_thread_participants_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.mpbc_message_threads(id) ON DELETE CASCADE;


--
-- Name: mpbc_thread_participants mpbc_thread_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_thread_participants
    ADD CONSTRAINT mpbc_thread_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: infrastructure_notification_queue notification_queue_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_notification_queue
    ADD CONSTRAINT notification_queue_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: infrastructure_participation_log participation_log_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_participation_log
    ADD CONSTRAINT participation_log_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: infrastructure_participation_log participation_log_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_participation_log
    ADD CONSTRAINT participation_log_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.infrastructure_sessions(id);


--
-- Name: mp_core_person_group person_group_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_group
    ADD CONSTRAINT person_group_cycle_id_fkey FOREIGN KEY (cycle_id) REFERENCES public.infrastructure_program_cycle(id);


--
-- Name: mp_core_person_group person_group_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_group
    ADD CONSTRAINT person_group_org_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: mp_core_person_role person_role_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mp_core_person_role
    ADD CONSTRAINT person_role_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: infrastructure_program_cycle program_cycle_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_program_cycle
    ADD CONSTRAINT program_cycle_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: mpbc_session_participation session_participation_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_session_participation
    ADD CONSTRAINT session_participation_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.mpbc_practice_session(id);


--
-- Name: infrastructure_sessions sessions_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_sessions
    ADD CONSTRAINT sessions_cycle_id_fkey FOREIGN KEY (cycle_id) REFERENCES public.infrastructure_program_cycle(id);


--
-- Name: infrastructure_sessions sessions_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_sessions
    ADD CONSTRAINT sessions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: infrastructure_system_settings system_settings_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.infrastructure_system_settings
    ADD CONSTRAINT system_settings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.mp_core_organizations(id);


--
-- Name: mpbc_template_usage_log template_usage_log_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mpbc_template_usage_log
    ADD CONSTRAINT template_usage_log_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.mpbc_practice_templates_enhanced(id);


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: mp_core_person Admin can delete all in org; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can delete all in org" ON public.mp_core_person FOR DELETE TO authenticated USING ((organization_id IN ( SELECT p.organization_id
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = auth.uid()) AND (p.is_admin = true)))));


--
-- Name: mp_core_person Admin can insert in org; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can insert in org" ON public.mp_core_person FOR INSERT TO authenticated WITH CHECK ((organization_id IN ( SELECT p.organization_id
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = auth.uid()) AND (p.is_admin = true)))));


--
-- Name: mp_core_person Admin can select all in org; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can select all in org" ON public.mp_core_person FOR SELECT TO authenticated USING ((organization_id IN ( SELECT p.organization_id
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = auth.uid()) AND (p.is_admin = true)))));


--
-- Name: mp_core_person Admin can update all in org; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can update all in org" ON public.mp_core_person FOR UPDATE TO authenticated USING ((organization_id IN ( SELECT p.organization_id
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = auth.uid()) AND (p.is_admin = true)))));


--
-- Name: mp_core_person Allow authenticated users to insert their own record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to insert their own record" ON public.mp_core_person FOR INSERT WITH CHECK ((auth_uid = auth.uid()));


--
-- Name: mp_core_person Allow authenticated users to read their own record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to read their own record" ON public.mp_core_person FOR SELECT USING ((auth_uid = auth.uid()));


--
-- Name: mp_core_person Allow authenticated users to update their own record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to update their own record" ON public.mp_core_person FOR UPDATE USING ((auth_uid = auth.uid())) WITH CHECK ((auth_uid = auth.uid()));


--
-- Name: mp_core_person Allow organization admins to create person records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow organization admins to create person records" ON public.mp_core_person FOR INSERT WITH CHECK (public.is_org_admin(organization_id, auth.uid()));


--
-- Name: mp_core_person Allow organization admins to delete person records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow organization admins to delete person records" ON public.mp_core_person FOR DELETE USING (public.is_org_admin(organization_id, auth.uid()));


--
-- Name: mp_core_person Allow organization admins to read person records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow organization admins to read person records" ON public.mp_core_person FOR SELECT USING (public.is_org_admin(organization_id, auth.uid()));


--
-- Name: mp_core_person Allow organization admins to update person records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow organization admins to update person records" ON public.mp_core_person FOR UPDATE USING (public.is_org_admin(organization_id, auth.uid()));


--
-- Name: mpbc_player_skill_challenge Allow read for all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow read for all" ON public.mpbc_player_skill_challenge FOR SELECT USING (true);


--
-- Name: mpbc_skill_tag Allow read for all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow read for all" ON public.mpbc_skill_tag FOR SELECT USING (true);


--
-- Name: mpbc_organizations Authenticated can select organizations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can select organizations" ON public.mpbc_organizations FOR SELECT TO authenticated USING (true);


--
-- Name: mp_core_organizations Authenticated users can view organizations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view organizations" ON public.mp_core_organizations FOR SELECT TO authenticated USING (true);


--
-- Name: mp_core_person Coach can insert own record in org; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Coach can insert own record in org" ON public.mp_core_person FOR INSERT TO authenticated WITH CHECK (((auth_uid = auth.uid()) AND (person_type = 'coach'::text)));


--
-- Name: mp_core_person Coach can select own record in org; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Coach can select own record in org" ON public.mp_core_person FOR SELECT TO authenticated USING (((auth_uid = auth.uid()) AND (person_type = 'coach'::text)));


--
-- Name: mp_core_person Superadmin can delete all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmin can delete all" ON public.mp_core_person FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = auth.uid()) AND (p.is_superadmin = true)))));


--
-- Name: mp_core_person Superadmin can insert all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmin can insert all" ON public.mp_core_person FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = auth.uid()) AND (p.is_superadmin = true)))));


--
-- Name: mp_core_person Superadmin can select all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmin can select all" ON public.mp_core_person FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = auth.uid()) AND (p.is_superadmin = true)))));


--
-- Name: mp_core_person Superadmin can update all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmin can update all" ON public.mp_core_person FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = auth.uid()) AND (p.is_superadmin = true)))));


--
-- Name: infrastructure_dashboard_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.infrastructure_dashboard_config ENABLE ROW LEVEL SECURITY;

--
-- Name: infrastructure_file_storage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.infrastructure_file_storage ENABLE ROW LEVEL SECURITY;

--
-- Name: infrastructure_file_storage infrastructure_file_storage_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY infrastructure_file_storage_delete_policy ON public.infrastructure_file_storage FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (ur.person_id = infrastructure_file_storage.uploaded_by) OR ((ur.is_admin = true) AND (ur.organization_id = infrastructure_file_storage.organization_id))))));


--
-- Name: infrastructure_file_storage infrastructure_file_storage_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY infrastructure_file_storage_insert_policy ON public.infrastructure_file_storage FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (ur.organization_id = infrastructure_file_storage.organization_id)))));


--
-- Name: infrastructure_file_storage infrastructure_file_storage_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY infrastructure_file_storage_policy ON public.infrastructure_file_storage FOR SELECT USING (((public_access = true) OR (EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (infrastructure_file_storage.uploaded_by = ur.person_id)))) OR ((entity_type = 'person'::text) AND (EXISTS ( SELECT 1
   FROM public.mp_core_person p
  WHERE (p.id = infrastructure_file_storage.entity_id))))));


--
-- Name: infrastructure_file_storage infrastructure_file_storage_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY infrastructure_file_storage_update_policy ON public.infrastructure_file_storage FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (ur.person_id = infrastructure_file_storage.uploaded_by) OR ((ur.is_admin = true) AND (ur.organization_id = infrastructure_file_storage.organization_id))))));


--
-- Name: infrastructure_notification_queue; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.infrastructure_notification_queue ENABLE ROW LEVEL SECURITY;

--
-- Name: infrastructure_notification_queue infrastructure_notification_queue_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY infrastructure_notification_queue_select_policy ON public.infrastructure_notification_queue FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (ur.person_id = infrastructure_notification_queue.recipient_id)))));


--
-- Name: infrastructure_participation_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.infrastructure_participation_log ENABLE ROW LEVEL SECURITY;

--
-- Name: infrastructure_program_cycle; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.infrastructure_program_cycle ENABLE ROW LEVEL SECURITY;

--
-- Name: infrastructure_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.infrastructure_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: infrastructure_sessions infrastructure_sessions_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY infrastructure_sessions_select_policy ON public.infrastructure_sessions FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.is_superadmin = true))) OR (EXISTS ( SELECT 1
   FROM (public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN public.mp_core_group g ON ((g.id = infrastructure_sessions.group_id)))
  WHERE ((ur.organization_id = g.organization_id) AND ((ur.is_admin = true) OR (infrastructure_sessions.group_id = ANY (ur.team_ids))))))));


--
-- Name: infrastructure_sessions infrastructure_sessions_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY infrastructure_sessions_update_policy ON public.infrastructure_sessions FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM (public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN public.mp_core_group g ON ((g.id = infrastructure_sessions.group_id)))
  WHERE ((ur.is_superadmin = true) OR ((ur.is_admin = true) AND (ur.organization_id = g.organization_id)) OR ((ur.role = 'coach'::text) AND (infrastructure_sessions.group_id = ANY (ur.team_ids)))))));


--
-- Name: infrastructure_system_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.infrastructure_system_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: mp_core_actions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mp_core_actions ENABLE ROW LEVEL SECURITY;

--
-- Name: mp_core_actions mp_core_actions_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY mp_core_actions_select_policy ON public.mp_core_actions FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (ur.person_id = mp_core_actions.person_id)))) OR (EXISTS ( SELECT 1
   FROM (public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN public.mp_core_person_group mpg ON ((mpg.person_id = mp_core_actions.person_id)))
  WHERE ((ur.role = 'coach'::text) AND (mpg.group_id = ANY (ur.team_ids)) AND (mpg.status = 'active'::text)))) OR (EXISTS ( SELECT 1
   FROM (public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN public.mp_core_person p ON ((p.id = mp_core_actions.person_id)))
  WHERE ((ur.is_admin = true) AND (ur.organization_id = p.organization_id))))));


--
-- Name: mp_core_actions mp_core_actions_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY mp_core_actions_update_policy ON public.mp_core_actions FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (ur.person_id = mp_core_actions.person_id)))) OR (EXISTS ( SELECT 1
   FROM (public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN public.mp_core_person_group mpg ON ((mpg.person_id = mp_core_actions.person_id)))
  WHERE ((ur.role = ANY (ARRAY['coach'::text, 'admin'::text])) AND (mpg.group_id = ANY (ur.team_ids)) AND (mpg.status = 'active'::text))))));


--
-- Name: mp_core_group mp_core_group_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY mp_core_group_insert_policy ON public.mp_core_group FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR ((ur.is_admin = true) AND (ur.organization_id = mp_core_group.organization_id))))));


--
-- Name: mp_core_group mp_core_group_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY mp_core_group_select_policy ON public.mp_core_group FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (ur.organization_id = mp_core_group.organization_id)))));


--
-- Name: mp_core_group mp_core_group_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY mp_core_group_update_policy ON public.mp_core_group FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR ((ur.is_admin = true) AND (ur.organization_id = mp_core_group.organization_id)) OR ((ur.role = 'coach'::text) AND (mp_core_group.id = ANY (ur.team_ids)))))));


--
-- Name: mp_core_intentions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mp_core_intentions ENABLE ROW LEVEL SECURITY;

--
-- Name: mp_core_intentions mp_core_intentions_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY mp_core_intentions_select_policy ON public.mp_core_intentions FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.is_superadmin = true))) OR (EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.person_id = mp_core_intentions.person_id))) OR (EXISTS ( SELECT 1
   FROM (public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN public.mp_core_person_group mpg ON ((mpg.person_id = mp_core_intentions.person_id)))
  WHERE ((ur.role = 'coach'::text) AND (mpg.group_id = ANY (ur.team_ids)) AND (mpg.status = 'active'::text)))) OR (EXISTS ( SELECT 1
   FROM (public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN public.mp_core_person p ON ((p.id = mp_core_intentions.person_id)))
  WHERE ((ur.is_admin = true) AND (ur.organization_id = p.organization_id))))));


--
-- Name: mp_core_intentions mp_core_intentions_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY mp_core_intentions_update_policy ON public.mp_core_intentions FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.is_superadmin = true))) OR (EXISTS ( SELECT 1
   FROM (public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN public.mp_core_person_group mpg ON ((mpg.person_id = mp_core_intentions.person_id)))
  WHERE ((ur.role = 'coach'::text) AND (mpg.group_id = ANY (ur.team_ids)) AND (mpg.status = 'active'::text)))) OR (EXISTS ( SELECT 1
   FROM (public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN public.mp_core_person p ON ((p.id = mp_core_intentions.person_id)))
  WHERE ((ur.is_admin = true) AND (ur.organization_id = p.organization_id))))));


--
-- Name: mp_core_person_group mp_core_person_group_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY mp_core_person_group_select_policy ON public.mp_core_person_group FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.is_superadmin = true))) OR (EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.person_id = mp_core_person_group.person_id))) OR (EXISTS ( SELECT 1
   FROM (public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN public.mp_core_group g ON ((g.id = mp_core_person_group.group_id)))
  WHERE ((ur.is_admin = true) AND (ur.organization_id = g.organization_id)))) OR (EXISTS ( SELECT 1
   FROM public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.role = 'coach'::text) AND (mp_core_person_group.group_id = ANY (ur.team_ids)))))));


--
-- Name: mp_core_person_group mp_core_person_group_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY mp_core_person_group_update_policy ON public.mp_core_person_group FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM (public.get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN public.mp_core_group g ON ((g.id = mp_core_person_group.group_id)))
  WHERE ((ur.is_superadmin = true) OR ((ur.is_admin = true) AND (ur.organization_id = g.organization_id)) OR ((ur.role = 'coach'::text) AND (mp_core_person_group.group_id = ANY (ur.team_ids)))))));


--
-- Name: mp_core_reflections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mp_core_reflections ENABLE ROW LEVEL SECURITY;

--
-- Name: mp_philosophy_arc_advancement; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mp_philosophy_arc_advancement ENABLE ROW LEVEL SECURITY;

--
-- Name: mp_philosophy_arc_collective; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mp_philosophy_arc_collective ENABLE ROW LEVEL SECURITY;

--
-- Name: mp_philosophy_arc_responsibility; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mp_philosophy_arc_responsibility ENABLE ROW LEVEL SECURITY;

--
-- Name: mp_philosophy_challenge_point; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mp_philosophy_challenge_point ENABLE ROW LEVEL SECURITY;

--
-- Name: mpbc_group; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mpbc_group ENABLE ROW LEVEL SECURITY;

--
-- Name: mpbc_organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mpbc_organizations ENABLE ROW LEVEL SECURITY;

--
-- Name: mpbc_person; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mpbc_person ENABLE ROW LEVEL SECURITY;

--
-- Name: mpbc_person_group; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mpbc_person_group ENABLE ROW LEVEL SECURITY;

--
-- Name: mpbc_player_skill_challenge; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mpbc_player_skill_challenge ENABLE ROW LEVEL SECURITY;

--
-- Name: mpbc_practice_theme; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mpbc_practice_theme ENABLE ROW LEVEL SECURITY;

--
-- Name: mpbc_skill_prerequisites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mpbc_skill_prerequisites ENABLE ROW LEVEL SECURITY;

--
-- Name: mpbc_skill_tag; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mpbc_skill_tag ENABLE ROW LEVEL SECURITY;

--
-- Name: infrastructure_program_cycle program_cycle_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY program_cycle_delete_policy ON public.infrastructure_program_cycle FOR DELETE TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = ( SELECT auth.uid() AS uid)) AND (p.is_superadmin = true)))) OR (((((auth.jwt() ->> 'app_metadata'::text))::jsonb ->> 'organization_id'::text) = (organization_id)::text) AND (EXISTS ( SELECT 1
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = ( SELECT auth.uid() AS uid)) AND (p.is_admin = true)))))));


--
-- Name: infrastructure_program_cycle program_cycle_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY program_cycle_insert_policy ON public.infrastructure_program_cycle FOR INSERT TO authenticated WITH CHECK (((EXISTS ( SELECT 1
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = ( SELECT auth.uid() AS uid)) AND (p.is_superadmin = true)))) OR (((((auth.jwt() ->> 'app_metadata'::text))::jsonb ->> 'organization_id'::text) = (organization_id)::text) AND (EXISTS ( SELECT 1
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = ( SELECT auth.uid() AS uid)) AND (p.is_admin = true)))))));


--
-- Name: infrastructure_program_cycle program_cycle_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY program_cycle_select_policy ON public.infrastructure_program_cycle FOR SELECT TO authenticated USING (((organization_id)::text = (((auth.jwt() ->> 'app_metadata'::text))::jsonb ->> 'organization_id'::text)));


--
-- Name: infrastructure_program_cycle program_cycle_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY program_cycle_update_policy ON public.infrastructure_program_cycle FOR UPDATE TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = ( SELECT auth.uid() AS uid)) AND (p.is_superadmin = true)))) OR (((((auth.jwt() ->> 'app_metadata'::text))::jsonb ->> 'organization_id'::text) = (organization_id)::text) AND (EXISTS ( SELECT 1
   FROM public.mp_core_person p
  WHERE ((p.auth_uid = ( SELECT auth.uid() AS uid)) AND (p.is_admin = true)))))));


--
-- Name: mpbc_group temp_allow_all_authenticated_read_mpbc_group; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY temp_allow_all_authenticated_read_mpbc_group ON public.mpbc_group FOR SELECT TO authenticated USING (true);


--
-- Name: mpbc_person temp_allow_all_authenticated_read_mpbc_person; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY temp_allow_all_authenticated_read_mpbc_person ON public.mpbc_person FOR SELECT TO authenticated USING (true);


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

