-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."group_type" AS ENUM('team', 'pod', 'session');--> statement-breakpoint
CREATE TABLE "mp_philosophy_arc_collective" (
	"phase" bigint,
	"title" text,
	"description" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mp_philosophy_arc_collective" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mpbc_outcome" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text,
	"description" text,
	"theme_id" uuid,
	"phase_id" uuid,
	"measurement_type" text,
	"success_criteria" text,
	"active" boolean,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_person_group" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"person_id" uuid,
	"group_id" uuid,
	"role" text,
	"organization_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"cycle_id" uuid,
	"position" text,
	"identifier" text,
	"status" text,
	"metadata" jsonb,
	"joined_at" timestamp with time zone,
	"left_at" timestamp with time zone,
	"created_by" uuid
);
--> statement-breakpoint
ALTER TABLE "mpbc_person_group" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mpbc_performance_metrics" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"metric_type" text,
	"metric_value" double precision,
	"metric_date" timestamp with time zone,
	"season_id" uuid,
	"calculation_method" text,
	"data_points" integer,
	"confidence_score" double precision,
	"notes" text,
	"calculated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mpbc_performance_indicators" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"cla_benchmark_id" uuid,
	"level" text,
	"description" text,
	"mp_core_benchmark_standard_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_person_profile" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"mp_core_person_id" uuid,
	"age_band_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"advancement_level" text,
	"responsibility_tier" text,
	"basketball_profile" jsonb
);
--> statement-breakpoint
CREATE TABLE "mpbc_person_metadata" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"mp_core_person_id" uuid,
	"advancement_level" text,
	"responsibility_tier" text,
	"basketball_profile" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_person" (
	"id" uuid PRIMARY KEY NOT NULL,
	"mp_core_person_id" uuid NOT NULL,
	"basketball_advancement_level" text,
	"basketball_responsibility_tier" text,
	"basketball_collective_phase" text,
	"position" text,
	"jersey_number" text,
	"height" text,
	"skill_ratings" jsonb,
	"strengths" text[],
	"areas_for_improvement" text[],
	"previous_advancement_level" text,
	"last_advancement_date" timestamp with time zone,
	"advancement_evidence" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid,
	"display_name" text,
	"metadata" jsonb,
	"first_name" text,
	"last_name" text,
	"email" text,
	"phone" text,
	"notes" text,
	"person_type" text,
	"organization_id" uuid,
	"is_admin" boolean,
	"is_superadmin" boolean,
	"active" boolean,
	"date_of_birth" timestamp with time zone,
	"emergency_contact" jsonb,
	"profile_image_url" text,
	"medical_info" jsonb,
	"parent_guardian_info" jsonb,
	"created_by" uuid,
	"updated_by" uuid,
	"basketball_profile" jsonb,
	"business_profile" jsonb,
	"education_profile" jsonb
);
--> statement-breakpoint
ALTER TABLE "mpbc_person" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mpbc_phase" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text,
	"description" text,
	"pillar_id" uuid,
	"key_concepts" text,
	"order_index" integer,
	"active" boolean,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mp_core_organizations" (
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text DEFAULT 'sports' NOT NULL,
	"description" text,
	"logo_url" text,
	"contact_info" jsonb DEFAULT '{}'::jsonb,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"subscription_tier" text DEFAULT 'basic',
	"overlay_version" text DEFAULT 'mpbc-v1.0',
	"active" boolean DEFAULT true,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infrastructure_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"organization_id" uuid,
	"role" text DEFAULT 'member',
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mp_philosophy_benchmark_framework" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"measurement_types" jsonb NOT NULL,
	"progression_rules" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "mp_philosophy_benchmark_framework_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "mpbc_pillar" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text,
	"description" text,
	"focus_area" text,
	"key_principles" text,
	"desired_outcomes" text,
	"order_index" integer,
	"active" boolean,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mp_philosophy_arc_responsibility" (
	"tier" bigint,
	"title" text,
	"description" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mp_philosophy_arc_responsibility" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mpbc_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"table_name" text,
	"record_id" uuid,
	"action" text,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_benchmark_constraints" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"cla_benchmark_id" uuid,
	"constraint_id" uuid,
	"priority" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_age_bands" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text,
	"min_age" integer,
	"max_age" integer,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infrastructure_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"organization_id" uuid,
	"role" text DEFAULT 'member',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "memberships_role_check" CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text]))
);
--> statement-breakpoint
CREATE TABLE "mpbc_block_player_assignment" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"block_id" uuid,
	"player_id" uuid,
	"special_role" text,
	"constraints" jsonb,
	"objectives" text,
	"modifications" text,
	"performance_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "mp_core_person_role" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"person_id" uuid,
	"organization_id" uuid,
	"role" text NOT NULL,
	"permissions" text[] DEFAULT '{""}',
	"scope_type" text,
	"scope_ids" uuid[],
	"active" boolean DEFAULT true,
	"started_at" timestamp with time zone DEFAULT now(),
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "mp_core_intentions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"person_id" uuid,
	"group_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"target_date" date,
	"status" text DEFAULT 'active',
	"challenge_level" integer DEFAULT 3,
	"benchmark_targets" jsonb,
	"development_stage" text,
	"advancement_level" integer,
	"responsibility_tier" integer,
	"progress_percentage" integer DEFAULT 0,
	"domain_code" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"cla_category_focus" text,
	"optimal_challenge_level" integer,
	"context_complexity_rating" integer
);
--> statement-breakpoint
ALTER TABLE "mp_core_intentions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mp_philosophy_arc_advancement" (
	"level" bigint,
	"title" text,
	"description" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mp_philosophy_arc_advancement" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "infrastructure_participation_log" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"session_id" uuid,
	"person_id" uuid,
	"status" text NOT NULL,
	"arrival_time" time,
	"departure_time" time,
	"participation_level" integer,
	"energy_level" integer,
	"focus_level" integer,
	"notes" text,
	"absence_reason" text,
	"advance_notice" boolean DEFAULT false,
	"makeup_required" boolean DEFAULT false,
	"metadata" jsonb,
	"recorded_at" timestamp with time zone DEFAULT now(),
	"recorded_by" uuid,
	"organization_id" uuid
);
--> statement-breakpoint
ALTER TABLE "infrastructure_participation_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "infrastructure_sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"group_id" uuid,
	"cycle_id" uuid,
	"session_number" integer,
	"session_type" text DEFAULT 'regular',
	"date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"location" text,
	"session_objective" text,
	"pre_session_notes" text,
	"post_session_notes" text,
	"facilitator_reflection" text,
	"intensity_level" integer,
	"status" text DEFAULT 'planned',
	"expected_attendance" integer,
	"actual_attendance" integer,
	"conditions" text,
	"equipment_issues" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	"organization_id" uuid
);
--> statement-breakpoint
ALTER TABLE "infrastructure_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mp_core_person_group" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"person_id" uuid,
	"group_id" uuid,
	"role" text NOT NULL,
	"organization_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"cycle_id" uuid,
	"position" text,
	"identifier" text,
	"status" text DEFAULT 'active',
	"metadata" jsonb,
	"joined_at" timestamp with time zone DEFAULT now(),
	"left_at" timestamp with time zone,
	"created_by" uuid,
	"updated_at" timestamp with time zone,
	"payer_id" uuid
);
--> statement-breakpoint
ALTER TABLE "mp_core_person_group" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mpbc_cla_benchmarks" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"cla_category_id" uuid,
	"age_band_id" uuid,
	"context" text,
	"assessment_criteria" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"benchmark_category_id" uuid,
	"advancement_level" text
);
--> statement-breakpoint
CREATE TABLE "mpbc_cla_categories" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text,
	"description" text,
	"learning_focus" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_coach_template_preferences" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"coach_id" uuid,
	"template_id" uuid,
	"preference_score" integer,
	"usage_frequency" integer,
	"last_used" timestamp with time zone,
	"preferred_modifications" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_constraint_type" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text,
	"description" text,
	"category" text,
	"application_method" text,
	"example_implementations" jsonb,
	"intensity_scalable" boolean,
	"attendance_adaptable" boolean,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infrastructure_program_cycle" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"year" integer NOT NULL,
	"term" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"description" text,
	"objectives" text[],
	"active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid
);
--> statement-breakpoint
ALTER TABLE "infrastructure_program_cycle" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mp_core_actions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"person_id" uuid,
	"group_id" uuid,
	"intention_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'planned',
	"executed_at" timestamp with time zone,
	"duration_minutes" integer,
	"challenge_level" integer,
	"success_rate" numeric(5, 2),
	"benchmark_assessments" jsonb,
	"advancement_progress" jsonb,
	"responsibility_progress" jsonb,
	"challenge_rating" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "mp_core_actions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mp_core_reflections" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"person_id" uuid,
	"group_id" uuid,
	"action_id" uuid,
	"intention_id" uuid,
	"content" text NOT NULL,
	"insights" text,
	"next_steps" text,
	"challenge_feedback" text,
	"perceived_difficulty" integer,
	"development_insights" jsonb,
	"benchmark_progress" jsonb,
	"advancement_insights" text,
	"responsibility_insights" text,
	"collective_insights" text,
	"advancement_progress" jsonb,
	"responsibility_progress" jsonb,
	"collective_progress" jsonb,
	"confidence_score" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "mp_core_reflections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mp_philosophy_arc_types" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"domain_code" text NOT NULL,
	"stages" jsonb NOT NULL,
	"typical_duration_days" integer,
	"default_graduation_threshold" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "mp_philosophy_arc_types_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "mpbc_core_skill_mapping" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"mpbc_skill_id" uuid,
	"core_skill_name" text,
	"mapping_strength" integer,
	"mapping_context" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"core_skill_id" uuid,
	"relationship_type" text,
	"ai_confidence_score" integer,
	"development_priority" integer,
	"contextual_factors" jsonb,
	"skill_transfer_coefficient" double precision,
	"optimal_age_range" text,
	"prerequisite_skills" text[],
	"complementary_skills" text[]
);
--> statement-breakpoint
CREATE TABLE "mpbc_constraints_bank" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"constraint_name" text,
	"constraint_text" text,
	"skill_tag" text,
	"offensive_or_defensive" text,
	"constraint_type" text,
	"example_contexts" text,
	"confidence_score" numeric,
	"notes" text,
	"prompt_keywords" text,
	"ai_parsing_rules" jsonb
);
--> statement-breakpoint
CREATE TABLE "mpbc_constraint_manipulations" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text,
	"description" text,
	"constraint_type" text,
	"cla_category_id" uuid,
	"challenge_level" integer,
	"implementation_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_core_skills" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"display_name" text,
	"category" text,
	"subcategory" text,
	"description" text,
	"synonyms" text[],
	"is_active" boolean DEFAULT true,
	"parent_skill_id" uuid,
	"use_case" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"combo_code" text
);
--> statement-breakpoint
CREATE TABLE "mpbc_person_role" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"person_id" uuid,
	"organization_id" uuid,
	"role" text NOT NULL,
	"permissions" text[] DEFAULT '{""}',
	"scope_type" text,
	"scope_ids" uuid[],
	"active" boolean DEFAULT true,
	"started_at" timestamp with time zone DEFAULT now(),
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "mpbc_development_plan" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"player_id" uuid,
	"group_id" uuid,
	"season_id" uuid,
	"title" text,
	"objective" text,
	"primary_pillar_id" uuid,
	"secondary_pillar_id" uuid,
	"focus_skills_id" uuid,
	"target_outcomes" text,
	"baseline_assessment" text,
	"target_metrics" jsonb,
	"timeline_weeks" integer,
	"priority_level" text,
	"status" text,
	"progress_percentage" integer,
	"last_review_date" timestamp with time zone,
	"next_review_date" timestamp with time zone,
	"progress_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	"cla_primary_benchmark_id" uuid,
	"cla_secondary_benchmark_id" uuid,
	"cla_tertiary_benchmark_id" uuid,
	"intelligence_development_goals" jsonb,
	"context_assessment_enabled" boolean,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"archived_by" uuid,
	"target_end_date" timestamp with time zone,
	"actual_end_date" timestamp with time zone,
	"org_id" uuid,
	"organization_id" uuid,
	"version" text,
	"overlay_schema" text,
	"cycle_id" uuid,
	"person_id" uuid,
	"metadata" jsonb,
	"old_id" uuid,
	"migration_phase" text,
	"needs_enhancement" boolean,
	"original_content" text,
	"priority" integer
);
--> statement-breakpoint
CREATE TABLE "mpbc_development_plan_progress" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"pdp_id" uuid,
	"skill_tag_id" uuid,
	"assessment_date" timestamp with time zone,
	"previous_level" text,
	"current_level" text,
	"improvement_notes" text,
	"evidence" text,
	"next_steps" text,
	"assessed_by" uuid,
	"assessment_method" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infrastructure_system_settings" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid,
	"category" text NOT NULL,
	"setting_key" text NOT NULL,
	"setting_value" jsonb NOT NULL,
	"description" text,
	"data_type" text NOT NULL,
	"is_public" boolean DEFAULT false,
	"requires_restart" boolean DEFAULT false,
	"last_changed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "infrastructure_system_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "infrastructure_dashboard_config" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"person_id" uuid,
	"dashboard_type" text NOT NULL,
	"widget_config" jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"organization_id" uuid
);
--> statement-breakpoint
ALTER TABLE "infrastructure_dashboard_config" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mp_philosophy_challenge_point" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text,
	"description" text,
	"calculation_rules" jsonb,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "mp_philosophy_challenge_point" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mpbc_cue_pack" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text,
	"skill_tag_id" uuid,
	"phase_id" uuid,
	"cue_type" text,
	"cues" text[],
	"when_to_use" text,
	"example_scenarios" text,
	"effectiveness_rating" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infrastructure_file_storage" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer,
	"bucket_name" text NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"uploaded_by" uuid,
	"description" text,
	"tags" text[],
	"public_access" boolean DEFAULT false,
	"thumbnail_path" text,
	"processing_status" text DEFAULT 'uploaded',
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"organization_id" uuid
);
--> statement-breakpoint
ALTER TABLE "infrastructure_file_storage" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "infrastructure_notification_queue" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"notification_type" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"data" jsonb,
	"priority" integer DEFAULT 3,
	"status" text DEFAULT 'queued',
	"scheduled_for" timestamp with time zone DEFAULT now(),
	"sent_at" timestamp with time zone,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"organization_id" uuid
);
--> statement-breakpoint
ALTER TABLE "infrastructure_notification_queue" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mpbc_development_plan_assessments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"pdp_id" uuid,
	"mp_core_benchmark_assessment_id" uuid,
	"assessment_date" timestamp with time zone,
	"video_evidence_url" text,
	"context_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_drill_master" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text,
	"description" text,
	"category" text,
	"subcategory" text,
	"setup_instructions" text,
	"coaching_points" text,
	"equipment_needed" text,
	"space_requirements" text,
	"min_players" integer,
	"max_players" integer,
	"optimal_players" integer,
	"duration_minutes" integer,
	"difficulty_level" text,
	"age_appropriate" text,
	"skill_tags" text[],
	"phase_tags" text[],
	"video_url" text,
	"diagram_url" text,
	"pdf_url" text,
	"tags" text[],
	"verified" boolean,
	"usage_count" integer,
	"rating_avg" double precision,
	"active" boolean,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "mp_core_group" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"group_type" text,
	"lead_person_id" uuid,
	"organization_id" uuid,
	"program" text,
	"level_category" text,
	"description" text,
	"max_capacity" integer,
	"schedule" jsonb,
	"active" boolean DEFAULT true,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "mp_core_group" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mpbc_drill_phase_tags" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"drill_id" uuid,
	"phase_id" uuid,
	"relevance_level" integer
);
--> statement-breakpoint
CREATE TABLE "mpbc_drill_skill_tags" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"drill_id" uuid,
	"skill_tag_id" uuid,
	"emphasis_level" integer
);
--> statement-breakpoint
CREATE TABLE "mpbc_observations" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"player_id" uuid,
	"observer_id" uuid,
	"skill_tags" text[],
	"cla_category" text,
	"context" text,
	"observation_text" text,
	"performance_rating" integer,
	"basketball_specific_metrics" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"development_plan_id" uuid,
	"archived_at" timestamp with time zone,
	"archived_by" uuid,
	"org_id" uuid,
	"person_id" uuid,
	"group_id" uuid,
	"cycle_id" uuid,
	"organization_id" uuid,
	"tags" text[],
	"observation_date" timestamp with time zone,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "mpbc_group" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"mp_core_group_id" uuid,
	"division" text,
	"conference" text,
	"playing_style" text,
	"team_philosophy" text,
	"season_record" text,
	"team_statistics" jsonb,
	"home_court" text,
	"practice_facility" text,
	"equipment_inventory" jsonb,
	"travel_requirements" text,
	"collective_skill_level" text,
	"team_chemistry_rating" integer,
	"leadership_structure" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"name" text,
	"group_type" text,
	"lead_person_id" uuid,
	"program" text,
	"level_category" text,
	"description" text,
	"max_capacity" integer,
	"schedule" jsonb,
	"metadata" jsonb,
	"active" boolean,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "mpbc_group" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mpbc_drill_org" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid,
	"master_drill_id" uuid,
	"name" text,
	"description" text,
	"customizations" jsonb,
	"private" boolean,
	"active" boolean,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "mpbc_goal_tracking" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"person_id" uuid,
	"pdp_id" uuid,
	"team_id" uuid,
	"season_id" uuid,
	"goal_type" text,
	"title" text,
	"description" text,
	"target_metric" text,
	"target_value" text,
	"current_value" text,
	"deadline" timestamp with time zone,
	"priority" text,
	"status" text,
	"progress_notes" text,
	"last_updated" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "mpbc_group_metadata" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"mp_core_group_id" uuid,
	"collective_growth_phase" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_group_profile" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"mpbc_group_id" uuid,
	"collective_advancement_level" text,
	"collective_responsibility_tier" text,
	"collective_growth_phase" text,
	"offensive_rating" integer,
	"defensive_rating" integer,
	"pace_of_play" integer,
	"team_efficiency" integer,
	"strengths" text[],
	"areas_for_improvement" text[],
	"team_goals" text,
	"problem_solving_effectiveness" integer,
	"adaptability_rating" integer,
	"communication_effectiveness" integer,
	"performance_trends" jsonb,
	"milestone_achievements" text[],
	"last_team_assessment_date" timestamp with time zone,
	"assessment_notes" text,
	"next_development_targets" text[],
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_individual_challenge_points" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"mp_core_person_id" uuid,
	"cla_category_id" uuid,
	"current_challenge_level" integer,
	"optimal_challenge_level" integer,
	"success_rate" double precision,
	"last_calculated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_organizations" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"type" text,
	"description" text,
	"logo_url" text,
	"contact_info" jsonb,
	"settings" jsonb,
	"subscription_tier" text,
	"overlay_version" text,
	"active" boolean,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_practice_block_cla_constraints" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"practice_block_id" uuid,
	"constraint_manipulation_id" uuid,
	"application_notes" text,
	"effectiveness_rating" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_practice_templates_enhanced" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"template_id" text,
	"base_practice_number" integer,
	"attendance_min" integer,
	"attendance_max" integer,
	"intensity_level" integer,
	"focus_area" text,
	"template_blocks" jsonb,
	"estimated_duration" integer,
	"mpbc_alignment" jsonb,
	"constraint_density" double precision,
	"attendance_adaptations" jsonb,
	"variability_factors" jsonb,
	"cla_enhanced" boolean,
	"effectiveness_score" double precision,
	"usage_count" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_practice_block" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"session_id" uuid,
	"master_drill_id" uuid,
	"org_drill_id" uuid,
	"block_name" text,
	"description" text,
	"phase_id" uuid,
	"theme_id" uuid,
	"objective" text,
	"duration_minutes" integer,
	"order_index" integer,
	"format" text,
	"constraints" jsonb,
	"coaching_emphasis" text,
	"success_criteria" text,
	"modifications" text,
	"equipment_needed" text,
	"space_setup" text,
	"player_groupings" jsonb,
	"notes" text,
	"completed" boolean,
	"effectiveness_rating" integer,
	"active" boolean,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	"cla_intelligence_targets" jsonb,
	"context_complexity_level" integer,
	"assessment_opportunities" text
);
--> statement-breakpoint
CREATE TABLE "mpbc_practice_session" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"team_id" uuid,
	"season_id" uuid,
	"session_number" integer,
	"date" timestamp with time zone,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"location" text,
	"facility_info" text,
	"primary_theme_id" uuid,
	"secondary_theme_id" uuid,
	"session_objective" text,
	"pre_practice_notes" text,
	"post_practice_notes" text,
	"coach_reflection" text,
	"intensity_level" integer,
	"status" text,
	"expected_attendance" integer,
	"actual_attendance" integer,
	"weather_conditions" text,
	"equipment_issues" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "mpbc_player_skill_challenge" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"development_plan_id" uuid,
	"skill_tag_id" uuid,
	"challenge_title" text,
	"description" text,
	"success_criteria" text,
	"practice_frequency" text,
	"deadline" timestamp with time zone,
	"priority" text,
	"difficulty" text,
	"status" text,
	"progress_percentage" integer,
	"coach_notes" text,
	"player_notes" text,
	"resources" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	"player_id" uuid
);
--> statement-breakpoint
ALTER TABLE "mpbc_player_skill_challenge" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "infrastructure_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" numeric NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"invited_by" integer NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mpbc_practice_theme" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"description" text,
	"category" text,
	"subcategory" text,
	"phase_id" text,
	"pillar_id" text,
	"combo_code" bigint,
	"synonyms" jsonb,
	"use_case" text,
	"verified" boolean,
	"active" boolean,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"suggested_by" text,
	"source_uid" text
);
--> statement-breakpoint
ALTER TABLE "mpbc_practice_theme" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mpbc_prompt_templates" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"prompt_name" text NOT NULL,
	"use_case" text NOT NULL,
	"prompt_template" text NOT NULL,
	"system_instructions" text,
	"example_inputs" jsonb,
	"example_outputs" jsonb,
	"model_parameters" jsonb,
	"version" text DEFAULT 'v1.0',
	"active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_season" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"year" integer NOT NULL,
	"term" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"description" text,
	"goals" text[],
	"active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "unique_active_season" UNIQUE("organization_id","active"),
	CONSTRAINT "season_check" CHECK (end_date > start_date),
	CONSTRAINT "season_term_check" CHECK (term = ANY (ARRAY['fall'::text, 'winter'::text, 'spring'::text, 'summer'::text, 'annual'::text]))
);
--> statement-breakpoint
CREATE TABLE "mpbc_session_participation" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"session_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"blocks_participated" uuid[],
	"leadership_displayed" text[],
	"effort_level" integer,
	"attitude_rating" integer,
	"skill_demonstration" text[],
	"areas_struggled" text[],
	"coach_feedback" text,
	"player_self_assessment" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"recorded_by" uuid,
	CONSTRAINT "session_participation_session_id_player_id_key" UNIQUE("session_id","player_id"),
	CONSTRAINT "session_participation_attitude_rating_check" CHECK ((attitude_rating >= 1) AND (attitude_rating <= 5)),
	CONSTRAINT "session_participation_effort_level_check" CHECK ((effort_level >= 1) AND (effort_level <= 5))
);
--> statement-breakpoint
CREATE TABLE "mpbc_signal_type" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"signal_name" text NOT NULL,
	"description" text,
	"category" text,
	"trigger_conditions" jsonb,
	"recommended_actions" text[],
	"priority_level" integer DEFAULT 3,
	"auto_generate" boolean DEFAULT false,
	"prompt_template" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infrastructure_activity_logs" (
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid,
	"organization_id" uuid
);
--> statement-breakpoint
CREATE TABLE "mp_core_person" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"display_name" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"first_name" text,
	"last_name" text,
	"email" text,
	"phone" text,
	"notes" text,
	"person_type" text,
	"organization_id" uuid,
	"is_admin" boolean DEFAULT false,
	"is_superadmin" boolean DEFAULT false,
	"active" boolean DEFAULT true,
	"date_of_birth" date,
	"emergency_contact" jsonb,
	"profile_image_url" text,
	"medical_info" jsonb,
	"parent_guardian_info" jsonb,
	"created_by" uuid,
	"updated_by" uuid,
	"auth_uid" uuid,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_product_id" text,
	"plan_name" text,
	"subscription_status" text,
	"seats_purchased" integer DEFAULT 1,
	"seats_used" integer DEFAULT 1,
	CONSTRAINT "mp_core_person_stripe_customer_id_key" UNIQUE("stripe_customer_id"),
	CONSTRAINT "mp_core_person_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "mp_core_person_stripe_subscription_id_key" UNIQUE("stripe_subscription_id"),
	CONSTRAINT "mp_core_person_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "mp_core_person" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mpbc_template_usage_log" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"template_id" uuid,
	"session_id" uuid,
	"organization_id" uuid,
	"coach_id" uuid,
	"attendance_actual" integer,
	"effectiveness_rating" integer,
	"modifications_made" jsonb,
	"coach_feedback" text,
	"would_use_again" boolean,
	"used_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_skill_prerequisites" (
	"skill_id" text,
	"prerequisite_skill_id" text,
	"required" boolean,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mpbc_skill_prerequisites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mpbc_version_config" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"version" text NOT NULL,
	"schema_version" text NOT NULL,
	"prompt_library" jsonb,
	"constraint_definitions" jsonb,
	"ai_model_config" jsonb,
	"active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpbc_skill_tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"description" text,
	"category" text,
	"difficulty_level" bigint,
	"prerequisites" text,
	"pillar_id" text,
	"parent_skill_id" text,
	"progression_order" bigint,
	"active" boolean,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"cla_category_mapping" text,
	"intelligence_focus" text,
	"context_requirements" text
);
--> statement-breakpoint
ALTER TABLE "mpbc_skill_tag" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mpbc_core_person_profile" (
	"person_id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid,
	"height_cm" integer,
	"dominant_hand" text,
	"playing_position" text,
	"preferred_shot_zone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"advancement_level" text,
	"responsibility_tier" text,
	"basketball_profile" jsonb
);
--> statement-breakpoint
ALTER TABLE "mpbc_person_group" ADD CONSTRAINT "mpbc_person_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mpbc_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_person_group" ADD CONSTRAINT "mpbc_person_group_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mpbc_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_person" ADD CONSTRAINT "fk_mpbc_person_mp_core_person" FOREIGN KEY ("mp_core_person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_person" ADD CONSTRAINT "mpbc_person_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_invites" ADD CONSTRAINT "invites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_memberships" ADD CONSTRAINT "memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_role" ADD CONSTRAINT "fk_person_role_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_role" ADD CONSTRAINT "fk_person_role_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_role" ADD CONSTRAINT "fk_person_role_person" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_role" ADD CONSTRAINT "mp_person_role_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_role" ADD CONSTRAINT "person_role_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_intentions" ADD CONSTRAINT "fk_intentions_group" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_intentions" ADD CONSTRAINT "fk_intentions_person" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_intentions" ADD CONSTRAINT "mp_core_intentions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_intentions" ADD CONSTRAINT "mp_core_intentions_team_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_participation_log" ADD CONSTRAINT "participation_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_participation_log" ADD CONSTRAINT "participation_log_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."infrastructure_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_sessions" ADD CONSTRAINT "infrastructure_sessions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_sessions" ADD CONSTRAINT "sessions_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "public"."infrastructure_program_cycle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_sessions" ADD CONSTRAINT "sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_group" ADD CONSTRAINT "fk_person_group_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_group" ADD CONSTRAINT "fk_person_group_group" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_group" ADD CONSTRAINT "fk_person_group_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_group" ADD CONSTRAINT "fk_person_group_payer" FOREIGN KEY ("payer_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_group" ADD CONSTRAINT "fk_person_group_person" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_group" ADD CONSTRAINT "mp_core_person_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_group" ADD CONSTRAINT "mp_core_person_group_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_group" ADD CONSTRAINT "mp_core_person_group_payer_id_mp_core_person_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_group" ADD CONSTRAINT "mp_core_person_group_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_group" ADD CONSTRAINT "person_group_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "public"."infrastructure_program_cycle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person_group" ADD CONSTRAINT "person_group_org_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_program_cycle" ADD CONSTRAINT "program_cycle_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_actions" ADD CONSTRAINT "fk_actions_group" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_actions" ADD CONSTRAINT "fk_actions_intention" FOREIGN KEY ("intention_id") REFERENCES "public"."mp_core_intentions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_actions" ADD CONSTRAINT "fk_actions_person" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_actions" ADD CONSTRAINT "mp_core_actions_intention_id_fkey" FOREIGN KEY ("intention_id") REFERENCES "public"."mp_core_intentions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_actions" ADD CONSTRAINT "mp_core_actions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_actions" ADD CONSTRAINT "mp_core_actions_team_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_reflections" ADD CONSTRAINT "fk_reflections_action" FOREIGN KEY ("action_id") REFERENCES "public"."mp_core_actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_reflections" ADD CONSTRAINT "fk_reflections_group" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_reflections" ADD CONSTRAINT "fk_reflections_intention" FOREIGN KEY ("intention_id") REFERENCES "public"."mp_core_intentions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_reflections" ADD CONSTRAINT "fk_reflections_person" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_reflections" ADD CONSTRAINT "mp_core_reflections_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "public"."mp_core_actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_reflections" ADD CONSTRAINT "mp_core_reflections_intention_id_fkey" FOREIGN KEY ("intention_id") REFERENCES "public"."mp_core_intentions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_reflections" ADD CONSTRAINT "mp_core_reflections_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_reflections" ADD CONSTRAINT "mp_core_reflections_team_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_person_role" ADD CONSTRAINT "mpbc_person_role_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_person_role" ADD CONSTRAINT "mpbc_person_role_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_person_role" ADD CONSTRAINT "mpbc_person_role_organization_id_fkey1" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_person_role" ADD CONSTRAINT "mpbc_person_role_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_person_role" ADD CONSTRAINT "mpbc_person_role_person_id_fkey1" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_development_plan" ADD CONSTRAINT "fk_mpbc_development_plan_person" FOREIGN KEY ("person_id") REFERENCES "public"."mpbc_person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_development_plan" ADD CONSTRAINT "mpbc_development_plan_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."mp_core_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_development_plan" ADD CONSTRAINT "mpbc_development_plan_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."mpbc_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_development_plan" ADD CONSTRAINT "mpbc_development_plan_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."mpbc_season"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_system_settings" ADD CONSTRAINT "system_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_dashboard_config" ADD CONSTRAINT "dashboard_config_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_file_storage" ADD CONSTRAINT "file_storage_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_notification_queue" ADD CONSTRAINT "notification_queue_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_group" ADD CONSTRAINT "fk_group_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_group" ADD CONSTRAINT "fk_group_lead_person" FOREIGN KEY ("lead_person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_group" ADD CONSTRAINT "fk_group_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_group" ADD CONSTRAINT "fk_group_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_observations" ADD CONSTRAINT "fk_mpbc_observations_development_plan" FOREIGN KEY ("development_plan_id") REFERENCES "public"."mpbc_development_plan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_observations" ADD CONSTRAINT "fk_mpbc_observations_person" FOREIGN KEY ("person_id") REFERENCES "public"."mpbc_person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_observations" ADD CONSTRAINT "mpbc_observations_observer_id_fkey" FOREIGN KEY ("observer_id") REFERENCES "public"."mpbc_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_observations" ADD CONSTRAINT "mpbc_observations_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."mpbc_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_group" ADD CONSTRAINT "fk_mpbc_group_mp_core_group" FOREIGN KEY ("mp_core_group_id") REFERENCES "public"."mp_core_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_group" ADD CONSTRAINT "mpbc_group_lead_person_id_fkey" FOREIGN KEY ("lead_person_id") REFERENCES "public"."mpbc_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_player_skill_challenge" ADD CONSTRAINT "mpbc_player_skill_challenge_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."mpbc_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_player_skill_challenge" ADD CONSTRAINT "mpbc_player_skill_challenge_development_plan_id_fkey" FOREIGN KEY ("development_plan_id") REFERENCES "public"."mpbc_development_plan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_player_skill_challenge" ADD CONSTRAINT "mpbc_player_skill_challenge_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."mpbc_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_player_skill_challenge" ADD CONSTRAINT "mpbc_player_skill_challenge_skill_tag_id_fkey" FOREIGN KEY ("skill_tag_id") REFERENCES "public"."mpbc_skill_tag"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_player_skill_challenge" ADD CONSTRAINT "mpbc_player_skill_challenge_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."mpbc_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_session_participation" ADD CONSTRAINT "session_participation_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."mpbc_practice_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_activity_logs" ADD CONSTRAINT "infrastructure_activity_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_activity_logs" ADD CONSTRAINT "infrastructure_activity_logs_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person" ADD CONSTRAINT "fk_person_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person" ADD CONSTRAINT "fk_person_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person" ADD CONSTRAINT "fk_person_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."mp_core_person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mp_core_person" ADD CONSTRAINT "mp_core_person_auth_uid_fkey" FOREIGN KEY ("auth_uid") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_template_usage_log" ADD CONSTRAINT "template_usage_log_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."mpbc_practice_templates_enhanced"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_core_person_profile" ADD CONSTRAINT "mpbc_core_person_profile_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."mp_core_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpbc_core_person_profile" ADD CONSTRAINT "mpbc_core_person_profile_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."mp_core_person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_mpbc_person_group_group_id" ON "mpbc_person_group" USING btree ("group_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mpbc_person_group_person_id" ON "mpbc_person_group" USING btree ("person_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mpbc_person_mp_core_person_id" ON "mpbc_person" USING btree ("mp_core_person_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mpbc_person_organization_id" ON "mpbc_person" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_orgs_id" ON "mp_core_organizations" USING btree ("id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_person_role_organization_id" ON "mp_core_person_role" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_person_role_person_id" ON "mp_core_person_role" USING btree ("person_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_participation_log_organization_id" ON "infrastructure_participation_log" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_participation_log_person_id" ON "infrastructure_participation_log" USING btree ("person_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_participation_log_session_id" ON "infrastructure_participation_log" USING btree ("session_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_sessions_cycle_id" ON "infrastructure_sessions" USING btree ("cycle_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_sessions_group_id" ON "infrastructure_sessions" USING btree ("group_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_sessions_organization_id" ON "infrastructure_sessions" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mp_core_person_group_group_id" ON "mp_core_person_group" USING btree ("group_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mp_core_person_group_person_id" ON "mp_core_person_group" USING btree ("person_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_person_group_cycle_id" ON "mp_core_person_group" USING btree ("cycle_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_person_group_group_id" ON "mp_core_person_group" USING btree ("group_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_person_group_person_id" ON "mp_core_person_group" USING btree ("person_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "mpbc_person_role_organization_id_idx" ON "mpbc_person_role" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "mpbc_person_role_person_id_idx" ON "mpbc_person_role" USING btree ("person_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mpbc_development_plan_archived_at" ON "mpbc_development_plan" USING btree ("archived_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_mpbc_development_plan_organization_id" ON "mpbc_development_plan" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mpbc_development_plan_person_id" ON "mpbc_development_plan" USING btree ("person_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_system_settings_organization_id" ON "infrastructure_system_settings" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_dashboard_config_organization_id" ON "infrastructure_dashboard_config" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_dashboard_config_person_id" ON "infrastructure_dashboard_config" USING btree ("person_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_file_storage_entity_id" ON "infrastructure_file_storage" USING btree ("entity_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_file_storage_organization_id" ON "infrastructure_file_storage" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_notification_queue_organization_id" ON "infrastructure_notification_queue" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_notification_queue_recipient_id" ON "infrastructure_notification_queue" USING btree ("recipient_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mpbc_observations_archived_at" ON "mpbc_observations" USING btree ("archived_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_mpbc_observations_development_plan_id" ON "mpbc_observations" USING btree ("development_plan_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mpbc_observations_organization_id" ON "mpbc_observations" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mpbc_observations_person_id" ON "mpbc_observations" USING btree ("person_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mpbc_group_mp_core_group_id" ON "mpbc_group" USING btree ("mp_core_group_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_season_dates" ON "mpbc_season" USING btree ("start_date" date_ops,"end_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_season_organization_active" ON "mpbc_season" USING btree ("organization_id" bool_ops,"active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_mp_core_person_auth_uid" ON "mp_core_person" USING btree ("auth_uid" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mp_core_person_organization_id" ON "mp_core_person" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mpbc_core_person_profile_org_id" ON "mpbc_core_person_profile" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE VIEW "public"."v_mp_core_group_membership" AS (SELECT mp_core_person_group.id, mp_core_person_group.group_id, mp_core_person_group.person_id, mp_core_person_group.role, mp_core_person_group.created_at, mp_core_person_group.updated_at FROM mp_core_person_group);--> statement-breakpoint
CREATE VIEW "public"."current_participants" WITH (security_invoker = on) AS (SELECT p.id, p.first_name, p.last_name, p.email, p.person_type, p.auth_uid, pg.group_id, g.name AS group_name, pg.role, pg."position", pg.identifier, pc.name AS cycle_name, p.organization_id FROM mp_core_person p JOIN mp_core_person_group pg ON p.id = pg.person_id JOIN mp_core_group g ON pg.group_id = g.id LEFT JOIN infrastructure_program_cycle pc ON pg.cycle_id = pc.id WHERE g.active = true);--> statement-breakpoint
CREATE VIEW "public"."session_participation_summary" WITH (security_invoker = on) AS (SELECT s.id AS session_id, s.date, s.session_type, g.name AS group_name, count(pl.id) AS total_tracked, count( CASE WHEN pl.status = 'present'::text THEN 1 ELSE NULL::integer END) AS present_count, count( CASE WHEN pl.status = 'absent'::text THEN 1 ELSE NULL::integer END) AS absent_count, count( CASE WHEN pl.status = 'late'::text THEN 1 ELSE NULL::integer END) AS late_count, round(count( CASE WHEN pl.status = 'present'::text THEN 1 ELSE NULL::integer END)::numeric / NULLIF(count(pl.id), 0)::numeric * 100::numeric, 2) AS attendance_percentage FROM infrastructure_sessions s JOIN mp_core_group g ON g.id = s.group_id LEFT JOIN infrastructure_participation_log pl ON pl.session_id = s.id GROUP BY s.id, s.date, s.session_type, g.name);--> statement-breakpoint
CREATE POLICY "temp_allow_all_authenticated_read_mpbc_person" ON "mpbc_person" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "mp_core_intentions_select_policy" ON "mp_core_intentions" AS PERMISSIVE FOR SELECT TO public USING (((EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.is_superadmin = true))) OR (EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.person_id = mp_core_intentions.person_id))) OR (EXISTS ( SELECT 1
   FROM (get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN mp_core_person_group mpg ON ((mpg.person_id = mp_core_intentions.person_id)))
  WHERE ((ur.role = 'coach'::text) AND (mpg.group_id = ANY (ur.team_ids)) AND (mpg.status = 'active'::text)))) OR (EXISTS ( SELECT 1
   FROM (get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN mp_core_person p ON ((p.id = mp_core_intentions.person_id)))
  WHERE ((ur.is_admin = true) AND (ur.organization_id = p.organization_id))))));--> statement-breakpoint
CREATE POLICY "mp_core_intentions_update_policy" ON "mp_core_intentions" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "infrastructure_sessions_select_policy" ON "infrastructure_sessions" AS PERMISSIVE FOR SELECT TO public USING (((EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.is_superadmin = true))) OR (EXISTS ( SELECT 1
   FROM (get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN mp_core_group g ON ((g.id = infrastructure_sessions.group_id)))
  WHERE ((ur.organization_id = g.organization_id) AND ((ur.is_admin = true) OR (infrastructure_sessions.group_id = ANY (ur.team_ids))))))));--> statement-breakpoint
CREATE POLICY "infrastructure_sessions_update_policy" ON "infrastructure_sessions" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "mp_core_person_group_select_policy" ON "mp_core_person_group" AS PERMISSIVE FOR SELECT TO public USING (((EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.is_superadmin = true))) OR (EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.person_id = mp_core_person_group.person_id))) OR (EXISTS ( SELECT 1
   FROM (get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN mp_core_group g ON ((g.id = mp_core_person_group.group_id)))
  WHERE ((ur.is_admin = true) AND (ur.organization_id = g.organization_id)))) OR (EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.role = 'coach'::text) AND (mp_core_person_group.group_id = ANY (ur.team_ids)))))));--> statement-breakpoint
CREATE POLICY "mp_core_person_group_update_policy" ON "mp_core_person_group" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "program_cycle_select_policy" ON "infrastructure_program_cycle" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((organization_id)::text = (((auth.jwt() ->> 'app_metadata'::text))::jsonb ->> 'organization_id'::text)));--> statement-breakpoint
CREATE POLICY "program_cycle_insert_policy" ON "infrastructure_program_cycle" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "program_cycle_update_policy" ON "infrastructure_program_cycle" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "program_cycle_delete_policy" ON "infrastructure_program_cycle" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "mp_core_actions_select_policy" ON "mp_core_actions" AS PERMISSIVE FOR SELECT TO public USING (((EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (ur.person_id = mp_core_actions.person_id)))) OR (EXISTS ( SELECT 1
   FROM (get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN mp_core_person_group mpg ON ((mpg.person_id = mp_core_actions.person_id)))
  WHERE ((ur.role = 'coach'::text) AND (mpg.group_id = ANY (ur.team_ids)) AND (mpg.status = 'active'::text)))) OR (EXISTS ( SELECT 1
   FROM (get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN mp_core_person p ON ((p.id = mp_core_actions.person_id)))
  WHERE ((ur.is_admin = true) AND (ur.organization_id = p.organization_id))))));--> statement-breakpoint
CREATE POLICY "mp_core_actions_update_policy" ON "mp_core_actions" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "infrastructure_file_storage_policy" ON "infrastructure_file_storage" AS PERMISSIVE FOR SELECT TO public USING (((public_access = true) OR (EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (infrastructure_file_storage.uploaded_by = ur.person_id)))) OR ((entity_type = 'person'::text) AND (EXISTS ( SELECT 1
   FROM mp_core_person p
  WHERE (p.id = infrastructure_file_storage.entity_id))))));--> statement-breakpoint
CREATE POLICY "infrastructure_file_storage_insert_policy" ON "infrastructure_file_storage" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "infrastructure_file_storage_update_policy" ON "infrastructure_file_storage" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "infrastructure_file_storage_delete_policy" ON "infrastructure_file_storage" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "infrastructure_notification_queue_select_policy" ON "infrastructure_notification_queue" AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (ur.person_id = infrastructure_notification_queue.recipient_id)))));--> statement-breakpoint
CREATE POLICY "mp_core_group_select_policy" ON "mp_core_group" AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (ur.organization_id = mp_core_group.organization_id)))));--> statement-breakpoint
CREATE POLICY "mp_core_group_update_policy" ON "mp_core_group" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "mp_core_group_insert_policy" ON "mp_core_group" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "temp_allow_all_authenticated_read_mpbc_group" ON "mpbc_group" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Allow read for all" ON "mpbc_player_skill_challenge" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Allow authenticated users to read their own record" ON "mp_core_person" AS PERMISSIVE FOR SELECT TO public USING ((auth_uid = auth.uid()));--> statement-breakpoint
CREATE POLICY "Allow authenticated users to insert their own record" ON "mp_core_person" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Allow authenticated users to update their own record" ON "mp_core_person" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Allow organization admins to read person records" ON "mp_core_person" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Superadmin can select all" ON "mp_core_person" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Superadmin can insert all" ON "mp_core_person" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Allow organization admins to create person records" ON "mp_core_person" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Allow organization admins to update person records" ON "mp_core_person" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Allow organization admins to delete person records" ON "mp_core_person" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Superadmin can update all" ON "mp_core_person" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Superadmin can delete all" ON "mp_core_person" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Admin can select all in org" ON "mp_core_person" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Admin can insert in org" ON "mp_core_person" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Admin can update all in org" ON "mp_core_person" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Admin can delete all in org" ON "mp_core_person" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Coach can select own record in org" ON "mp_core_person" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Coach can insert own record in org" ON "mp_core_person" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Allow read for all" ON "mpbc_skill_tag" AS PERMISSIVE FOR SELECT TO public USING (true);
*/