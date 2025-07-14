import {
  pgTable,
  bigint,
  text,
  timestamp,
  uuid,
  boolean,
  index,
  foreignKey,
  jsonb,
  doublePrecision,
  integer,
  pgPolicy,
  unique,
  check,
  date,
  time,
  numeric,
  varchar,
  pgView,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const groupType = pgEnum('group_type', ['team', 'pod', 'session']);

export const mpPhilosophyArcCollective = pgTable(
  'mp_philosophy_arc_collective',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    phase: bigint({ mode: 'number' }),
    title: text(),
    description: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
    id: uuid().defaultRandom().primaryKey().notNull(),
  }
);

export const mpbcOutcome = pgTable('mpbc_outcome', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  name: text(),
  description: text(),
  themeId: uuid('theme_id'),
  phaseId: uuid('phase_id'),
  measurementType: text('measurement_type'),
  successCriteria: text('success_criteria'),
  active: boolean(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const mpbcPersonGroup = pgTable(
  'mpbc_person_group',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    personId: uuid('person_id'),
    groupId: uuid('group_id'),
    role: text(),
    organizationId: uuid('organization_id'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    cycleId: uuid('cycle_id'),
    position: text(),
    identifier: text(),
    status: text(),
    metadata: jsonb(),
    joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'string' }),
    leftAt: timestamp('left_at', { withTimezone: true, mode: 'string' }),
    createdBy: uuid('created_by'),
  },
  table => [
    index('idx_mpbc_person_group_group_id').using(
      'btree',
      table.groupId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_mpbc_person_group_person_id').using(
      'btree',
      table.personId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [mpbcGroup.id],
      name: 'mpbc_person_group_group_id_fkey',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpbcPerson.id],
      name: 'mpbc_person_group_person_id_fkey',
    }),
  ]
);

export const mpbcPerformanceMetrics = pgTable('mpbc_performance_metrics', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  metricType: text('metric_type'),
  metricValue: doublePrecision('metric_value'),
  metricDate: timestamp('metric_date', { withTimezone: true, mode: 'string' }),
  seasonId: uuid('season_id'),
  calculationMethod: text('calculation_method'),
  dataPoints: integer('data_points'),
  confidenceScore: doublePrecision('confidence_score'),
  notes: text(),
  calculatedAt: timestamp('calculated_at', {
    withTimezone: true,
    mode: 'string',
  }),
});

export const mpbcPerformanceIndicators = pgTable(
  'mpbc_performance_indicators',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    claBenchmarkId: uuid('cla_benchmark_id'),
    level: text(),
    description: text(),
    mpCoreBenchmarkStandardId: uuid('mp_core_benchmark_standard_id'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  }
);

export const mpbcPersonProfile = pgTable('mpbc_person_profile', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  mpCorePersonId: uuid('mp_core_person_id'),
  ageBandId: uuid('age_band_id'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  advancementLevel: text('advancement_level'),
  responsibilityTier: text('responsibility_tier'),
  basketballProfile: jsonb('basketball_profile'),
});

export const mpbcPersonMetadata = pgTable('mpbc_person_metadata', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  mpCorePersonId: uuid('mp_core_person_id'),
  advancementLevel: text('advancement_level'),
  responsibilityTier: text('responsibility_tier'),
  basketballProfile: jsonb('basketball_profile'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const mpbcPerson = pgTable(
  'mpbc_person',
  {
    id: uuid().primaryKey().notNull(),
    mpCorePersonId: uuid('mp_core_person_id').notNull(),
    basketballAdvancementLevel: text('basketball_advancement_level'),
    basketballResponsibilityTier: text('basketball_responsibility_tier'),
    basketballCollectivePhase: text('basketball_collective_phase'),
    position: text(),
    jerseyNumber: text('jersey_number'),
    height: text(),
    skillRatings: jsonb('skill_ratings'),
    strengths: text().array(),
    areasForImprovement: text('areas_for_improvement').array(),
    previousAdvancementLevel: text('previous_advancement_level'),
    lastAdvancementDate: timestamp('last_advancement_date', {
      withTimezone: true,
      mode: 'string',
    }),
    advancementEvidence: text('advancement_evidence'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    userId: uuid('user_id'),
    displayName: text('display_name'),
    metadata: jsonb(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    email: text(),
    phone: text(),
    notes: text(),
    personType: text('person_type'),
    organizationId: uuid('organization_id'),
    isAdmin: boolean('is_admin'),
    isSuperadmin: boolean('is_superadmin'),
    active: boolean(),
    dateOfBirth: timestamp('date_of_birth', {
      withTimezone: true,
      mode: 'string',
    }),
    emergencyContact: jsonb('emergency_contact'),
    profileImageUrl: text('profile_image_url'),
    medicalInfo: jsonb('medical_info'),
    parentGuardianInfo: jsonb('parent_guardian_info'),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    basketballProfile: jsonb('basketball_profile'),
    businessProfile: jsonb('business_profile'),
    educationProfile: jsonb('education_profile'),
  },
  table => [
    index('idx_mpbc_person_mp_core_person_id').using(
      'btree',
      table.mpCorePersonId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_mpbc_person_organization_id').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.mpCorePersonId],
      foreignColumns: [mpCorePerson.id],
      name: 'fk_mpbc_person_mp_core_person',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.id],
      foreignColumns: [mpCorePerson.id],
      name: 'mpbc_person_id_fkey',
    }),
    pgPolicy('temp_allow_all_authenticated_read_mpbc_person', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`true`,
    }),
  ]
);

export const mpbcPhase = pgTable('mpbc_phase', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  name: text(),
  description: text(),
  pillarId: uuid('pillar_id'),
  keyConcepts: text('key_concepts'),
  orderIndex: integer('order_index'),
  active: boolean(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const mpCoreOrganizations = pgTable(
  'mp_core_organizations',
  {
    name: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    id: uuid().defaultRandom().primaryKey().notNull(),
    type: text().default('sports').notNull(),
    description: text(),
    logoUrl: text('logo_url'),
    contactInfo: jsonb('contact_info').default({}),
    settings: jsonb().default({}),
    subscriptionTier: text('subscription_tier').default('basic'),
    overlayVersion: text('overlay_version').default('mpbc-v1.0'),
    active: boolean().default(true),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  table => [
    index('idx_orgs_id').using(
      'btree',
      table.id.asc().nullsLast().op('uuid_ops')
    ),
  ]
);

export const infrastructureInvites = pgTable(
  'infrastructure_invites',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
    organizationId: uuid('organization_id'),
    role: text().default('member'),
    status: text().default('pending'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'invites_organization_id_fkey',
    }),
  ]
);

export const mpPhilosophyBenchmarkFramework = pgTable(
  'mp_philosophy_benchmark_framework',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    name: text().notNull(),
    description: text().notNull(),
    measurementTypes: jsonb('measurement_types').notNull(),
    progressionRules: jsonb('progression_rules').notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  table => [unique('mp_philosophy_benchmark_framework_name_key').on(table.name)]
);

export const mpbcPillar = pgTable('mpbc_pillar', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  name: text(),
  description: text(),
  focusArea: text('focus_area'),
  keyPrinciples: text('key_principles'),
  desiredOutcomes: text('desired_outcomes'),
  orderIndex: integer('order_index'),
  active: boolean(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const mpPhilosophyArcResponsibility = pgTable(
  'mp_philosophy_arc_responsibility',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    tier: bigint({ mode: 'number' }),
    title: text(),
    description: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
    id: uuid().defaultRandom().primaryKey().notNull(),
  }
);

export const mpbcAuditLog = pgTable('mpbc_audit_log', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  tableName: text('table_name'),
  recordId: uuid('record_id'),
  action: text(),
  newValues: jsonb('new_values'),
  changedBy: uuid('changed_by'),
  changedAt: timestamp('changed_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const mpbcBenchmarkConstraints = pgTable('mpbc_benchmark_constraints', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  claBenchmarkId: uuid('cla_benchmark_id'),
  constraintId: uuid('constraint_id'),
  priority: integer(),
  notes: text(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const mpbcAgeBands = pgTable('mpbc_age_bands', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  name: text(),
  minAge: integer('min_age'),
  maxAge: integer('max_age'),
  description: text(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const infrastructureMemberships = pgTable(
  'infrastructure_memberships',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id'),
    organizationId: uuid('organization_id'),
    role: text().default('member'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'memberships_organization_id_fkey',
    }),
    // TODO: Add foreign key to auth.users when available
    // foreignKey({
    //   columns: [table.userId],
    //   foreignColumns: [users.id],
    //   name: 'memberships_user_id_fkey',
    // }),
    check(
      'memberships_role_check',
      sql`role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])`
    ),
  ]
);

export const mpbcBlockPlayerAssignment = pgTable(
  'mpbc_block_player_assignment',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    blockId: uuid('block_id'),
    playerId: uuid('player_id'),
    specialRole: text('special_role'),
    constraints: jsonb(),
    objectives: text(),
    modifications: text(),
    performanceNotes: text('performance_notes'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    createdBy: uuid('created_by'),
  }
);

export const mpCorePersonRole = pgTable(
  'mp_core_person_role',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    personId: uuid('person_id'),
    organizationId: uuid('organization_id'),
    role: text().notNull(),
    permissions: text().array().default(['']),
    scopeType: text('scope_type'),
    scopeIds: uuid('scope_ids').array(),
    active: boolean().default(true),
    startedAt: timestamp('started_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    createdBy: uuid('created_by'),
  },
  table => [
    index('idx_person_role_organization_id').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_person_role_person_id').using(
      'btree',
      table.personId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [mpCorePerson.id],
      name: 'fk_person_role_created_by',
    }),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'fk_person_role_organization',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'fk_person_role_person',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'mp_person_role_person_id_fkey',
    }),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'person_role_organization_id_fkey',
    }),
  ]
);

export const mpCoreIntentions = pgTable(
  'mp_core_intentions',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    personId: uuid('person_id'),
    groupId: uuid('group_id'),
    title: text().notNull(),
    description: text(),
    targetDate: date('target_date'),
    status: text().default('active'),
    challengeLevel: integer('challenge_level').default(3),
    benchmarkTargets: jsonb('benchmark_targets'),
    developmentStage: text('development_stage'),
    advancementLevel: integer('advancement_level'),
    responsibilityTier: integer('responsibility_tier'),
    progressPercentage: integer('progress_percentage').default(0),
    domainCode: text('domain_code'),
    metadata: jsonb(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    claCategoryFocus: text('cla_category_focus'),
    optimalChallengeLevel: integer('optimal_challenge_level'),
    contextComplexityRating: integer('context_complexity_rating'),
  },
  table => [
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [mpCoreGroup.id],
      name: 'fk_intentions_group',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'fk_intentions_person',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'mp_core_intentions_person_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [mpCoreGroup.id],
      name: 'mp_core_intentions_team_id_fkey',
    }),
    pgPolicy('mp_core_intentions_select_policy', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
      using: sql`((EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.is_superadmin = true))) OR (EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.person_id = mp_core_intentions.person_id))) OR (EXISTS ( SELECT 1
   FROM (get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN mp_core_person_group mpg ON ((mpg.person_id = mp_core_intentions.person_id)))
  WHERE ((ur.role = 'coach'::text) AND (mpg.group_id = ANY (ur.team_ids)) AND (mpg.status = 'active'::text)))) OR (EXISTS ( SELECT 1
   FROM (get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN mp_core_person p ON ((p.id = mp_core_intentions.person_id)))
  WHERE ((ur.is_admin = true) AND (ur.organization_id = p.organization_id)))))`,
    }),
    pgPolicy('mp_core_intentions_update_policy', {
      as: 'permissive',
      for: 'update',
      to: ['public'],
    }),
  ]
);

export const mpPhilosophyArcAdvancement = pgTable(
  'mp_philosophy_arc_advancement',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    level: bigint({ mode: 'number' }),
    title: text(),
    description: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
    id: uuid().defaultRandom().primaryKey().notNull(),
  }
);

export const infrastructureParticipationLog = pgTable(
  'infrastructure_participation_log',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    sessionId: uuid('session_id'),
    personId: uuid('person_id'),
    status: text().notNull(),
    arrivalTime: time('arrival_time'),
    departureTime: time('departure_time'),
    participationLevel: integer('participation_level'),
    energyLevel: integer('energy_level'),
    focusLevel: integer('focus_level'),
    notes: text(),
    absenceReason: text('absence_reason'),
    advanceNotice: boolean('advance_notice').default(false),
    makeupRequired: boolean('makeup_required').default(false),
    metadata: jsonb(),
    recordedAt: timestamp('recorded_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    recordedBy: uuid('recorded_by'),
    organizationId: uuid('organization_id'),
  },
  table => [
    index('idx_participation_log_organization_id').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_participation_log_person_id').using(
      'btree',
      table.personId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_participation_log_session_id').using(
      'btree',
      table.sessionId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'participation_log_organization_id_fkey',
    }),
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [infrastructureSessions.id],
      name: 'participation_log_session_id_fkey',
    }),
  ]
);

export const infrastructureSessions = pgTable(
  'infrastructure_sessions',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    groupId: uuid('group_id'),
    cycleId: uuid('cycle_id'),
    sessionNumber: integer('session_number'),
    sessionType: text('session_type').default('regular'),
    date: date().notNull(),
    startTime: time('start_time'),
    endTime: time('end_time'),
    location: text(),
    sessionObjective: text('session_objective'),
    preSessionNotes: text('pre_session_notes'),
    postSessionNotes: text('post_session_notes'),
    facilitatorReflection: text('facilitator_reflection'),
    intensityLevel: integer('intensity_level'),
    status: text().default('planned'),
    expectedAttendance: integer('expected_attendance'),
    actualAttendance: integer('actual_attendance'),
    conditions: text(),
    equipmentIssues: text('equipment_issues'),
    metadata: jsonb(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    organizationId: uuid('organization_id'),
  },
  table => [
    index('idx_sessions_cycle_id').using(
      'btree',
      table.cycleId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_sessions_group_id').using(
      'btree',
      table.groupId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_sessions_organization_id').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [mpCoreGroup.id],
      name: 'infrastructure_sessions_group_id_fkey',
    }),
    foreignKey({
      columns: [table.cycleId],
      foreignColumns: [infrastructureProgramCycle.id],
      name: 'sessions_cycle_id_fkey',
    }),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'sessions_organization_id_fkey',
    }),
    pgPolicy('infrastructure_sessions_select_policy', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
      using: sql`((EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.is_superadmin = true))) OR (EXISTS ( SELECT 1
   FROM (get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN mp_core_group g ON ((g.id = infrastructure_sessions.group_id)))
  WHERE ((ur.organization_id = g.organization_id) AND ((ur.is_admin = true) OR (infrastructure_sessions.group_id = ANY (ur.team_ids)))))))`,
    }),
    pgPolicy('infrastructure_sessions_update_policy', {
      as: 'permissive',
      for: 'update',
      to: ['public'],
    }),
  ]
);

export const mpCorePersonGroup = pgTable(
  'mp_core_person_group',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    personId: uuid('person_id'),
    groupId: uuid('group_id'),
    role: text().notNull(),
    organizationId: uuid('organization_id'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    cycleId: uuid('cycle_id'),
    position: text(),
    identifier: text(),
    status: text().default('active'),
    metadata: jsonb(),
    joinedAt: timestamp('joined_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    leftAt: timestamp('left_at', { withTimezone: true, mode: 'string' }),
    createdBy: uuid('created_by'),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
    payerId: uuid('payer_id'),
  },
  table => [
    index('idx_mp_core_person_group_group_id').using(
      'btree',
      table.groupId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_mp_core_person_group_person_id').using(
      'btree',
      table.personId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_person_group_cycle_id').using(
      'btree',
      table.cycleId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_person_group_group_id').using(
      'btree',
      table.groupId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_person_group_person_id').using(
      'btree',
      table.personId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [mpCorePerson.id],
      name: 'fk_person_group_created_by',
    }),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [mpCoreGroup.id],
      name: 'fk_person_group_group',
    }),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'fk_person_group_organization',
    }),
    foreignKey({
      columns: [table.payerId],
      foreignColumns: [mpCorePerson.id],
      name: 'fk_person_group_payer',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'fk_person_group_person',
    }),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [mpCoreGroup.id],
      name: 'mp_core_person_group_group_id_fkey',
    }),
    foreignKey({
      columns: [table.payerId],
      foreignColumns: [mpCorePerson.id],
      name: 'mp_core_person_group_payer_id_fkey',
    }),
    foreignKey({
      columns: [table.payerId],
      foreignColumns: [mpCorePerson.id],
      name: 'mp_core_person_group_payer_id_mp_core_person_id_fk',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'mp_core_person_group_person_id_fkey',
    }),
    foreignKey({
      columns: [table.cycleId],
      foreignColumns: [infrastructureProgramCycle.id],
      name: 'person_group_cycle_id_fkey',
    }),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'person_group_org_id_fkey',
    }),
    pgPolicy('mp_core_person_group_select_policy', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
      using: sql`((EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.is_superadmin = true))) OR (EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE (ur.person_id = mp_core_person_group.person_id))) OR (EXISTS ( SELECT 1
   FROM (get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN mp_core_group g ON ((g.id = mp_core_person_group.group_id)))
  WHERE ((ur.is_admin = true) AND (ur.organization_id = g.organization_id)))) OR (EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.role = 'coach'::text) AND (mp_core_person_group.group_id = ANY (ur.team_ids))))))`,
    }),
    pgPolicy('mp_core_person_group_update_policy', {
      as: 'permissive',
      for: 'update',
      to: ['public'],
    }),
  ]
);

export const mpbcClaBenchmarks = pgTable('mpbc_cla_benchmarks', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  claCategoryId: uuid('cla_category_id'),
  ageBandId: uuid('age_band_id'),
  context: text(),
  assessmentCriteria: text('assessment_criteria'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  benchmarkCategoryId: uuid('benchmark_category_id'),
  advancementLevel: text('advancement_level'),
});

export const mpbcClaCategories = pgTable('mpbc_cla_categories', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  name: text(),
  description: text(),
  learningFocus: text('learning_focus'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const mpbcCoachTemplatePreferences = pgTable(
  'mpbc_coach_template_preferences',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    coachId: uuid('coach_id'),
    templateId: uuid('template_id'),
    preferenceScore: integer('preference_score'),
    usageFrequency: integer('usage_frequency'),
    lastUsed: timestamp('last_used', { withTimezone: true, mode: 'string' }),
    preferredModifications: jsonb('preferred_modifications'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  }
);

export const mpbcConstraintType = pgTable('mpbc_constraint_type', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  name: text(),
  description: text(),
  category: text(),
  applicationMethod: text('application_method'),
  exampleImplementations: jsonb('example_implementations'),
  intensityScalable: boolean('intensity_scalable'),
  attendanceAdaptable: boolean('attendance_adaptable'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const infrastructureProgramCycle = pgTable(
  'infrastructure_program_cycle',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    organizationId: uuid('organization_id'),
    name: text().notNull(),
    year: integer().notNull(),
    term: text(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    description: text(),
    objectives: text().array(),
    active: boolean().default(true),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    createdBy: uuid('created_by'),
  },
  table => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'program_cycle_organization_id_fkey',
    }),
    pgPolicy('program_cycle_select_policy', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`((organization_id)::text = (((auth.jwt() ->> 'app_metadata'::text))::jsonb ->> 'organization_id'::text))`,
    }),
    pgPolicy('program_cycle_insert_policy', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
    }),
    pgPolicy('program_cycle_update_policy', {
      as: 'permissive',
      for: 'update',
      to: ['authenticated'],
    }),
    pgPolicy('program_cycle_delete_policy', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
    }),
  ]
);

export const mpCoreActions = pgTable(
  'mp_core_actions',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    personId: uuid('person_id'),
    groupId: uuid('group_id'),
    intentionId: uuid('intention_id'),
    title: text().notNull(),
    description: text(),
    status: text().default('planned'),
    executedAt: timestamp('executed_at', {
      withTimezone: true,
      mode: 'string',
    }),
    durationMinutes: integer('duration_minutes'),
    challengeLevel: integer('challenge_level'),
    successRate: numeric('success_rate', { precision: 5, scale: 2 }),
    benchmarkAssessments: jsonb('benchmark_assessments'),
    advancementProgress: jsonb('advancement_progress'),
    responsibilityProgress: jsonb('responsibility_progress'),
    challengeRating: integer('challenge_rating'),
    metadata: jsonb(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [mpCoreGroup.id],
      name: 'fk_actions_group',
    }),
    foreignKey({
      columns: [table.intentionId],
      foreignColumns: [mpCoreIntentions.id],
      name: 'fk_actions_intention',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'fk_actions_person',
    }),
    foreignKey({
      columns: [table.intentionId],
      foreignColumns: [mpCoreIntentions.id],
      name: 'mp_core_actions_intention_id_fkey',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'mp_core_actions_person_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [mpCoreGroup.id],
      name: 'mp_core_actions_team_id_fkey',
    }),
    pgPolicy('mp_core_actions_select_policy', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
      using: sql`((EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (ur.person_id = mp_core_actions.person_id)))) OR (EXISTS ( SELECT 1
   FROM (get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN mp_core_person_group mpg ON ((mpg.person_id = mp_core_actions.person_id)))
  WHERE ((ur.role = 'coach'::text) AND (mpg.group_id = ANY (ur.team_ids)) AND (mpg.status = 'active'::text)))) OR (EXISTS ( SELECT 1
   FROM (get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
     JOIN mp_core_person p ON ((p.id = mp_core_actions.person_id)))
  WHERE ((ur.is_admin = true) AND (ur.organization_id = p.organization_id)))))`,
    }),
    pgPolicy('mp_core_actions_update_policy', {
      as: 'permissive',
      for: 'update',
      to: ['public'],
    }),
  ]
);

export const mpCoreReflections = pgTable(
  'mp_core_reflections',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    personId: uuid('person_id'),
    groupId: uuid('group_id'),
    actionId: uuid('action_id'),
    intentionId: uuid('intention_id'),
    content: text().notNull(),
    insights: text(),
    nextSteps: text('next_steps'),
    challengeFeedback: text('challenge_feedback'),
    perceivedDifficulty: integer('perceived_difficulty'),
    developmentInsights: jsonb('development_insights'),
    benchmarkProgress: jsonb('benchmark_progress'),
    advancementInsights: text('advancement_insights'),
    responsibilityInsights: text('responsibility_insights'),
    collectiveInsights: text('collective_insights'),
    advancementProgress: jsonb('advancement_progress'),
    responsibilityProgress: jsonb('responsibility_progress'),
    collectiveProgress: jsonb('collective_progress'),
    confidenceScore: integer('confidence_score'),
    metadata: jsonb(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.actionId],
      foreignColumns: [mpCoreActions.id],
      name: 'fk_reflections_action',
    }),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [mpCoreGroup.id],
      name: 'fk_reflections_group',
    }),
    foreignKey({
      columns: [table.intentionId],
      foreignColumns: [mpCoreIntentions.id],
      name: 'fk_reflections_intention',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'fk_reflections_person',
    }),
    foreignKey({
      columns: [table.actionId],
      foreignColumns: [mpCoreActions.id],
      name: 'mp_core_reflections_action_id_fkey',
    }),
    foreignKey({
      columns: [table.intentionId],
      foreignColumns: [mpCoreIntentions.id],
      name: 'mp_core_reflections_intention_id_fkey',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'mp_core_reflections_person_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [mpCoreGroup.id],
      name: 'mp_core_reflections_team_id_fkey',
    }),
  ]
);

export const mpPhilosophyArcTypes = pgTable(
  'mp_philosophy_arc_types',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    name: text().notNull(),
    description: text().notNull(),
    domainCode: text('domain_code').notNull(),
    stages: jsonb().notNull(),
    typicalDurationDays: integer('typical_duration_days'),
    defaultGraduationThreshold: numeric('default_graduation_threshold', {
      precision: 5,
      scale: 2,
    }),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  table => [unique('mp_philosophy_arc_types_name_key').on(table.name)]
);

export const mpbcCoreSkillMapping = pgTable('mpbc_core_skill_mapping', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  mpbcSkillId: uuid('mpbc_skill_id'),
  coreSkillName: text('core_skill_name'),
  mappingStrength: integer('mapping_strength'),
  mappingContext: text('mapping_context'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  coreSkillId: uuid('core_skill_id'),
  relationshipType: text('relationship_type'),
  aiConfidenceScore: integer('ai_confidence_score'),
  developmentPriority: integer('development_priority'),
  contextualFactors: jsonb('contextual_factors'),
  skillTransferCoefficient: doublePrecision('skill_transfer_coefficient'),
  optimalAgeRange: text('optimal_age_range'),
  prerequisiteSkills: text('prerequisite_skills').array(),
  complementarySkills: text('complementary_skills').array(),
});

export const mpbcConstraintsBank = pgTable('mpbc_constraints_bank', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  constraintName: text('constraint_name'),
  constraintText: text('constraint_text'),
  skillTag: text('skill_tag'),
  offensiveOrDefensive: text('offensive_or_defensive'),
  constraintType: text('constraint_type'),
  exampleContexts: text('example_contexts'),
  confidenceScore: numeric('confidence_score'),
  notes: text(),
  promptKeywords: text('prompt_keywords'),
  aiParsingRules: jsonb('ai_parsing_rules'),
});

export const mpbcConstraintManipulations = pgTable(
  'mpbc_constraint_manipulations',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    name: text(),
    description: text(),
    constraintType: text('constraint_type'),
    claCategoryId: uuid('cla_category_id'),
    challengeLevel: integer('challenge_level'),
    implementationNotes: text('implementation_notes'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  }
);

export const mpbcCoreSkills = pgTable('mpbc_core_skills', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  displayName: text('display_name'),
  category: text(),
  subcategory: text(),
  description: text(),
  synonyms: text().array(),
  isActive: boolean('is_active').default(true),
  parentSkillId: uuid('parent_skill_id'),
  useCase: text('use_case'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  comboCode: text('combo_code'),
});

export const mpbcPersonRole = pgTable(
  'mpbc_person_role',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    personId: uuid('person_id'),
    organizationId: uuid('organization_id'),
    role: text().notNull(),
    permissions: text().array().default(['']),
    scopeType: text('scope_type'),
    scopeIds: uuid('scope_ids').array(),
    active: boolean().default(true),
    startedAt: timestamp('started_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    createdBy: uuid('created_by'),
  },
  table => [
    index('mpbc_person_role_organization_id_idx').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('mpbc_person_role_person_id_idx').using(
      'btree',
      table.personId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [mpCorePerson.id],
      name: 'mpbc_person_role_created_by_fkey',
    }),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'mpbc_person_role_organization_id_fkey',
    }),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'mpbc_person_role_organization_id_fkey1',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'mpbc_person_role_person_id_fkey',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'mpbc_person_role_person_id_fkey1',
    }),
  ]
);

export const mpbcDevelopmentPlan = pgTable(
  'mpbc_development_plan',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    playerId: uuid('player_id'),
    groupId: uuid('group_id'),
    seasonId: uuid('season_id'),
    title: text(),
    objective: text(),
    primaryPillarId: uuid('primary_pillar_id'),
    secondaryPillarId: uuid('secondary_pillar_id'),
    focusSkillsId: uuid('focus_skills_id'),
    targetOutcomes: text('target_outcomes'),
    baselineAssessment: text('baseline_assessment'),
    targetMetrics: jsonb('target_metrics'),
    timelineWeeks: integer('timeline_weeks'),
    priorityLevel: text('priority_level'),
    status: text(),
    progressPercentage: integer('progress_percentage'),
    lastReviewDate: timestamp('last_review_date', {
      withTimezone: true,
      mode: 'string',
    }),
    nextReviewDate: timestamp('next_review_date', {
      withTimezone: true,
      mode: 'string',
    }),
    progressNotes: text('progress_notes'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    claPrimaryBenchmarkId: uuid('cla_primary_benchmark_id'),
    claSecondaryBenchmarkId: uuid('cla_secondary_benchmark_id'),
    claTertiaryBenchmarkId: uuid('cla_tertiary_benchmark_id'),
    intelligenceDevelopmentGoals: jsonb('intelligence_development_goals'),
    contextAssessmentEnabled: boolean('context_assessment_enabled'),
    startDate: timestamp('start_date', { withTimezone: true, mode: 'string' }),
    endDate: timestamp('end_date', { withTimezone: true, mode: 'string' }),
    archivedAt: timestamp('archived_at', {
      withTimezone: true,
      mode: 'string',
    }),
    archivedBy: uuid('archived_by'),
    targetEndDate: timestamp('target_end_date', {
      withTimezone: true,
      mode: 'string',
    }),
    actualEndDate: timestamp('actual_end_date', {
      withTimezone: true,
      mode: 'string',
    }),
    orgId: uuid('org_id'),
    organizationId: uuid('organization_id'),
    version: text(),
    overlaySchema: text('overlay_schema'),
    cycleId: uuid('cycle_id'),
    personId: uuid('person_id'),
    metadata: jsonb(),
    oldId: uuid('old_id'),
    migrationPhase: text('migration_phase'),
    needsEnhancement: boolean('needs_enhancement'),
    originalContent: text('original_content'),
    priority: integer(),
  },
  table => [
    index('idx_mpbc_development_plan_archived_at').using(
      'btree',
      table.archivedAt.asc().nullsLast().op('timestamptz_ops')
    ),
    index('idx_mpbc_development_plan_organization_id').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_mpbc_development_plan_person_id').using(
      'btree',
      table.personId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpbcPerson.id],
      name: 'fk_mpbc_development_plan_person',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [mpCoreGroup.id],
      name: 'mpbc_development_plan_group_id_fkey',
    }),
    foreignKey({
      columns: [table.playerId],
      foreignColumns: [mpbcPerson.id],
      name: 'mpbc_development_plan_player_id_fkey',
    }),
    foreignKey({
      columns: [table.seasonId],
      foreignColumns: [mpbcSeason.id],
      name: 'mpbc_development_plan_season_id_fkey',
    }),
  ]
);

export const mpbcDevelopmentPlanProgress = pgTable(
  'mpbc_development_plan_progress',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    pdpId: uuid('pdp_id'),
    skillTagId: uuid('skill_tag_id'),
    assessmentDate: timestamp('assessment_date', {
      withTimezone: true,
      mode: 'string',
    }),
    previousLevel: text('previous_level'),
    currentLevel: text('current_level'),
    improvementNotes: text('improvement_notes'),
    evidence: text(),
    nextSteps: text('next_steps'),
    assessedBy: uuid('assessed_by'),
    assessmentMethod: text('assessment_method'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  }
);

export const infrastructureSystemSettings = pgTable(
  'infrastructure_system_settings',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    organizationId: uuid('organization_id'),
    category: text().notNull(),
    settingKey: text('setting_key').notNull(),
    settingValue: jsonb('setting_value').notNull(),
    description: text(),
    dataType: text('data_type').notNull(),
    isPublic: boolean('is_public').default(false),
    requiresRestart: boolean('requires_restart').default(false),
    lastChangedBy: uuid('last_changed_by'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  table => [
    index('idx_system_settings_organization_id').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'system_settings_organization_id_fkey',
    }),
  ]
);

export const infrastructureDashboardConfig = pgTable(
  'infrastructure_dashboard_config',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    personId: uuid('person_id'),
    dashboardType: text('dashboard_type').notNull(),
    widgetConfig: jsonb('widget_config').notNull(),
    isDefault: boolean('is_default').default(false),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    organizationId: uuid('organization_id'),
  },
  table => [
    index('idx_dashboard_config_organization_id').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_dashboard_config_person_id').using(
      'btree',
      table.personId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'dashboard_config_organization_id_fkey',
    }),
  ]
);

export const mpPhilosophyChallengePoint = pgTable(
  'mp_philosophy_challenge_point',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    type: text(),
    description: text(),
    calculationRules: jsonb('calculation_rules'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  }
);

export const mpbcCuePack = pgTable('mpbc_cue_pack', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  name: text(),
  skillTagId: uuid('skill_tag_id'),
  phaseId: uuid('phase_id'),
  cueType: text('cue_type'),
  cues: text().array(),
  whenToUse: text('when_to_use'),
  exampleScenarios: text('example_scenarios'),
  effectivenessRating: integer('effectiveness_rating'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const infrastructureFileStorage = pgTable(
  'infrastructure_file_storage',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    fileName: text('file_name').notNull(),
    originalName: text('original_name').notNull(),
    filePath: text('file_path').notNull(),
    fileType: text('file_type').notNull(),
    fileSize: integer('file_size'),
    bucketName: text('bucket_name').notNull(),
    entityType: text('entity_type'),
    entityId: uuid('entity_id'),
    uploadedBy: uuid('uploaded_by'),
    description: text(),
    tags: text().array(),
    publicAccess: boolean('public_access').default(false),
    thumbnailPath: text('thumbnail_path'),
    processingStatus: text('processing_status').default('uploaded'),
    metadata: jsonb(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    organizationId: uuid('organization_id'),
  },
  table => [
    index('idx_file_storage_entity_id').using(
      'btree',
      table.entityId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_file_storage_organization_id').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'file_storage_organization_id_fkey',
    }),
    pgPolicy('infrastructure_file_storage_policy', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
      using: sql`((public_access = true) OR (EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (infrastructure_file_storage.uploaded_by = ur.person_id)))) OR ((entity_type = 'person'::text) AND (EXISTS ( SELECT 1
   FROM mp_core_person p
  WHERE (p.id = infrastructure_file_storage.entity_id)))))`,
    }),
    pgPolicy('infrastructure_file_storage_insert_policy', {
      as: 'permissive',
      for: 'insert',
      to: ['public'],
    }),
    pgPolicy('infrastructure_file_storage_update_policy', {
      as: 'permissive',
      for: 'update',
      to: ['public'],
    }),
    pgPolicy('infrastructure_file_storage_delete_policy', {
      as: 'permissive',
      for: 'delete',
      to: ['public'],
    }),
  ]
);

export const infrastructureNotificationQueue = pgTable(
  'infrastructure_notification_queue',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    recipientId: uuid('recipient_id').notNull(),
    notificationType: text('notification_type').notNull(),
    subject: text(),
    message: text().notNull(),
    data: jsonb(),
    priority: integer().default(3),
    status: text().default('queued'),
    scheduledFor: timestamp('scheduled_for', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').default(0),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    organizationId: uuid('organization_id'),
  },
  table => [
    index('idx_notification_queue_organization_id').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_notification_queue_recipient_id').using(
      'btree',
      table.recipientId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'notification_queue_organization_id_fkey',
    }),
    pgPolicy('infrastructure_notification_queue_select_policy', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
      using: sql`(EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (ur.person_id = infrastructure_notification_queue.recipient_id))))`,
    }),
  ]
);

export const mpbcDevelopmentPlanAssessments = pgTable(
  'mpbc_development_plan_assessments',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    pdpId: uuid('pdp_id'),
    mpCoreBenchmarkAssessmentId: uuid('mp_core_benchmark_assessment_id'),
    assessmentDate: timestamp('assessment_date', {
      withTimezone: true,
      mode: 'string',
    }),
    videoEvidenceUrl: text('video_evidence_url'),
    contextNotes: text('context_notes'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  }
);

export const mpbcDrillMaster = pgTable('mpbc_drill_master', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  name: text(),
  description: text(),
  category: text(),
  subcategory: text(),
  setupInstructions: text('setup_instructions'),
  coachingPoints: text('coaching_points'),
  equipmentNeeded: text('equipment_needed'),
  spaceRequirements: text('space_requirements'),
  minPlayers: integer('min_players'),
  maxPlayers: integer('max_players'),
  optimalPlayers: integer('optimal_players'),
  durationMinutes: integer('duration_minutes'),
  difficultyLevel: text('difficulty_level'),
  ageAppropriate: text('age_appropriate'),
  skillTags: text('skill_tags').array(),
  phaseTags: text('phase_tags').array(),
  videoUrl: text('video_url'),
  diagramUrl: text('diagram_url'),
  pdfUrl: text('pdf_url'),
  tags: text().array(),
  verified: boolean(),
  usageCount: integer('usage_count'),
  ratingAvg: doublePrecision('rating_avg'),
  active: boolean(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export const mpCoreGroup = pgTable(
  'mp_core_group',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    name: text().notNull(),
    metadata: jsonb(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    groupType: text('group_type'),
    leadPersonId: uuid('lead_person_id'),
    organizationId: uuid('organization_id'),
    program: text(),
    levelCategory: text('level_category'),
    description: text(),
    maxCapacity: integer('max_capacity'),
    schedule: jsonb(),
    active: boolean().default(true),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
  },
  table => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [mpCorePerson.id],
      name: 'fk_group_created_by',
    }),
    foreignKey({
      columns: [table.leadPersonId],
      foreignColumns: [mpCorePerson.id],
      name: 'fk_group_lead_person',
    }),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'fk_group_organization',
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [mpCorePerson.id],
      name: 'fk_group_updated_by',
    }),
    pgPolicy('mp_core_group_select_policy', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
      using: sql`(EXISTS ( SELECT 1
   FROM get_user_role() ur(person_id, organization_id, role, is_superadmin, is_admin, team_ids)
  WHERE ((ur.is_superadmin = true) OR (ur.organization_id = mp_core_group.organization_id))))`,
    }),
    pgPolicy('mp_core_group_update_policy', {
      as: 'permissive',
      for: 'update',
      to: ['public'],
    }),
    pgPolicy('mp_core_group_insert_policy', {
      as: 'permissive',
      for: 'insert',
      to: ['public'],
    }),
  ]
);

export const mpbcDrillPhaseTags = pgTable('mpbc_drill_phase_tags', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  drillId: uuid('drill_id'),
  phaseId: uuid('phase_id'),
  relevanceLevel: integer('relevance_level'),
});

export const mpbcDrillSkillTags = pgTable('mpbc_drill_skill_tags', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  drillId: uuid('drill_id'),
  skillTagId: uuid('skill_tag_id'),
  emphasisLevel: integer('emphasis_level'),
});

export const mpbcObservations = pgTable(
  'mpbc_observations',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    playerId: uuid('player_id'),
    observerId: uuid('observer_id'),
    skillTags: text('skill_tags').array(),
    claCategory: text('cla_category'),
    context: text(),
    observationText: text('observation_text'),
    performanceRating: integer('performance_rating'),
    basketballSpecificMetrics: jsonb('basketball_specific_metrics'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    developmentPlanId: uuid('development_plan_id'),
    archivedAt: timestamp('archived_at', {
      withTimezone: true,
      mode: 'string',
    }),
    archivedBy: uuid('archived_by'),
    orgId: uuid('org_id'),
    personId: uuid('person_id'),
    groupId: uuid('group_id'),
    cycleId: uuid('cycle_id'),
    organizationId: uuid('organization_id'),
    tags: text().array(),
    observationDate: timestamp('observation_date', {
      withTimezone: true,
      mode: 'string',
    }),
    updatedBy: uuid('updated_by'),
  },
  table => [
    index('idx_mpbc_observations_archived_at').using(
      'btree',
      table.archivedAt.asc().nullsLast().op('timestamptz_ops')
    ),
    index('idx_mpbc_observations_development_plan_id').using(
      'btree',
      table.developmentPlanId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_mpbc_observations_organization_id').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_mpbc_observations_person_id').using(
      'btree',
      table.personId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.developmentPlanId],
      foreignColumns: [mpbcDevelopmentPlan.id],
      name: 'fk_mpbc_observations_development_plan',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpbcPerson.id],
      name: 'fk_mpbc_observations_person',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.observerId],
      foreignColumns: [mpbcPerson.id],
      name: 'mpbc_observations_observer_id_fkey',
    }),
    foreignKey({
      columns: [table.playerId],
      foreignColumns: [mpbcPerson.id],
      name: 'mpbc_observations_player_id_fkey',
    }),
  ]
);

export const mpbcGroup = pgTable(
  'mpbc_group',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    mpCoreGroupId: uuid('mp_core_group_id'),
    division: text(),
    conference: text(),
    playingStyle: text('playing_style'),
    teamPhilosophy: text('team_philosophy'),
    seasonRecord: text('season_record'),
    teamStatistics: jsonb('team_statistics'),
    homeCourt: text('home_court'),
    practiceFacility: text('practice_facility'),
    equipmentInventory: jsonb('equipment_inventory'),
    travelRequirements: text('travel_requirements'),
    collectiveSkillLevel: text('collective_skill_level'),
    teamChemistryRating: integer('team_chemistry_rating'),
    leadershipStructure: jsonb('leadership_structure'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    name: text(),
    groupType: text('group_type'),
    leadPersonId: uuid('lead_person_id'),
    program: text(),
    levelCategory: text('level_category'),
    description: text(),
    maxCapacity: integer('max_capacity'),
    schedule: jsonb(),
    metadata: jsonb(),
    active: boolean(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
  },
  table => [
    index('idx_mpbc_group_mp_core_group_id').using(
      'btree',
      table.mpCoreGroupId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.mpCoreGroupId],
      foreignColumns: [mpCoreGroup.id],
      name: 'fk_mpbc_group_mp_core_group',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.leadPersonId],
      foreignColumns: [mpbcPerson.id],
      name: 'mpbc_group_lead_person_id_fkey',
    }),
    pgPolicy('temp_allow_all_authenticated_read_mpbc_group', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`true`,
    }),
  ]
);

export const mpbcDrillOrg = pgTable('mpbc_drill_org', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  organizationId: uuid('organization_id'),
  masterDrillId: uuid('master_drill_id'),
  name: text(),
  description: text(),
  customizations: jsonb(),
  private: boolean(),
  active: boolean(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export const mpbcGoalTracking = pgTable('mpbc_goal_tracking', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  personId: uuid('person_id'),
  pdpId: uuid('pdp_id'),
  teamId: uuid('team_id'),
  seasonId: uuid('season_id'),
  goalType: text('goal_type'),
  title: text(),
  description: text(),
  targetMetric: text('target_metric'),
  targetValue: text('target_value'),
  currentValue: text('current_value'),
  deadline: timestamp({ withTimezone: true, mode: 'string' }),
  priority: text(),
  status: text(),
  progressNotes: text('progress_notes'),
  lastUpdated: timestamp('last_updated', {
    withTimezone: true,
    mode: 'string',
  }),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export const mpbcGroupMetadata = pgTable('mpbc_group_metadata', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  mpCoreGroupId: uuid('mp_core_group_id'),
  collectiveGrowthPhase: text('collective_growth_phase'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const mpbcGroupProfile = pgTable('mpbc_group_profile', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  mpbcGroupId: uuid('mpbc_group_id'),
  collectiveAdvancementLevel: text('collective_advancement_level'),
  collectiveResponsibilityTier: text('collective_responsibility_tier'),
  collectiveGrowthPhase: text('collective_growth_phase'),
  offensiveRating: integer('offensive_rating'),
  defensiveRating: integer('defensive_rating'),
  paceOfPlay: integer('pace_of_play'),
  teamEfficiency: integer('team_efficiency'),
  strengths: text().array(),
  areasForImprovement: text('areas_for_improvement').array(),
  teamGoals: text('team_goals'),
  problemSolvingEffectiveness: integer('problem_solving_effectiveness'),
  adaptabilityRating: integer('adaptability_rating'),
  communicationEffectiveness: integer('communication_effectiveness'),
  performanceTrends: jsonb('performance_trends'),
  milestoneAchievements: text('milestone_achievements').array(),
  lastTeamAssessmentDate: timestamp('last_team_assessment_date', {
    withTimezone: true,
    mode: 'string',
  }),
  assessmentNotes: text('assessment_notes'),
  nextDevelopmentTargets: text('next_development_targets').array(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const mpbcIndividualChallengePoints = pgTable(
  'mpbc_individual_challenge_points',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    mpCorePersonId: uuid('mp_core_person_id'),
    claCategoryId: uuid('cla_category_id'),
    currentChallengeLevel: integer('current_challenge_level'),
    optimalChallengeLevel: integer('optimal_challenge_level'),
    successRate: doublePrecision('success_rate'),
    lastCalculatedAt: timestamp('last_calculated_at', {
      withTimezone: true,
      mode: 'string',
    }),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  }
);

export const mpbcOrganizations = pgTable('mpbc_organizations', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  name: text(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  type: text(),
  description: text(),
  logoUrl: text('logo_url'),
  contactInfo: jsonb('contact_info'),
  settings: jsonb(),
  subscriptionTier: text('subscription_tier'),
  overlayVersion: text('overlay_version'),
  active: boolean(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const mpbcPracticeBlockClaConstraints = pgTable(
  'mpbc_practice_block_cla_constraints',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    practiceBlockId: uuid('practice_block_id'),
    constraintManipulationId: uuid('constraint_manipulation_id'),
    applicationNotes: text('application_notes'),
    effectivenessRating: integer('effectiveness_rating'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  }
);

export const mpbcPracticeTemplatesEnhanced = pgTable(
  'mpbc_practice_templates_enhanced',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    templateId: text('template_id'),
    basePracticeNumber: integer('base_practice_number'),
    attendanceMin: integer('attendance_min'),
    attendanceMax: integer('attendance_max'),
    intensityLevel: integer('intensity_level'),
    focusArea: text('focus_area'),
    templateBlocks: jsonb('template_blocks'),
    estimatedDuration: integer('estimated_duration'),
    mpbcAlignment: jsonb('mpbc_alignment'),
    constraintDensity: doublePrecision('constraint_density'),
    attendanceAdaptations: jsonb('attendance_adaptations'),
    variabilityFactors: jsonb('variability_factors'),
    claEnhanced: boolean('cla_enhanced'),
    effectivenessScore: doublePrecision('effectiveness_score'),
    usageCount: integer('usage_count'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  }
);

export const mpbcPracticeBlock = pgTable('mpbc_practice_block', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  sessionId: uuid('session_id'),
  masterDrillId: uuid('master_drill_id'),
  orgDrillId: uuid('org_drill_id'),
  blockName: text('block_name'),
  description: text(),
  phaseId: uuid('phase_id'),
  themeId: uuid('theme_id'),
  objective: text(),
  durationMinutes: integer('duration_minutes'),
  orderIndex: integer('order_index'),
  format: text(),
  constraints: jsonb(),
  coachingEmphasis: text('coaching_emphasis'),
  successCriteria: text('success_criteria'),
  modifications: text(),
  equipmentNeeded: text('equipment_needed'),
  spaceSetup: text('space_setup'),
  playerGroupings: jsonb('player_groupings'),
  notes: text(),
  completed: boolean(),
  effectivenessRating: integer('effectiveness_rating'),
  active: boolean(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
  claIntelligenceTargets: jsonb('cla_intelligence_targets'),
  contextComplexityLevel: integer('context_complexity_level'),
  assessmentOpportunities: text('assessment_opportunities'),
});

export const mpbcPracticeSession = pgTable('mpbc_practice_session', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  teamId: uuid('team_id'),
  seasonId: uuid('season_id'),
  sessionNumber: integer('session_number'),
  date: timestamp({ withTimezone: true, mode: 'string' }),
  startTime: timestamp('start_time', { withTimezone: true, mode: 'string' }),
  endTime: timestamp('end_time', { withTimezone: true, mode: 'string' }),
  location: text(),
  facilityInfo: text('facility_info'),
  primaryThemeId: uuid('primary_theme_id'),
  secondaryThemeId: uuid('secondary_theme_id'),
  sessionObjective: text('session_objective'),
  prePracticeNotes: text('pre_practice_notes'),
  postPracticeNotes: text('post_practice_notes'),
  coachReflection: text('coach_reflection'),
  intensityLevel: integer('intensity_level'),
  status: text(),
  expectedAttendance: integer('expected_attendance'),
  actualAttendance: integer('actual_attendance'),
  weatherConditions: text('weather_conditions'),
  equipmentIssues: text('equipment_issues'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export const mpbcPlayerSkillChallenge = pgTable(
  'mpbc_player_skill_challenge',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    developmentPlanId: uuid('development_plan_id'),
    skillTagId: uuid('skill_tag_id'),
    challengeTitle: text('challenge_title'),
    description: text(),
    successCriteria: text('success_criteria'),
    practiceFrequency: text('practice_frequency'),
    deadline: timestamp({ withTimezone: true, mode: 'string' }),
    priority: text(),
    difficulty: text(),
    status: text(),
    progressPercentage: integer('progress_percentage'),
    coachNotes: text('coach_notes'),
    playerNotes: text('player_notes'),
    resources: jsonb(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    playerId: uuid('player_id'),
  },
  table => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [mpbcPerson.id],
      name: 'mpbc_player_skill_challenge_created_by_fkey',
    }),
    foreignKey({
      columns: [table.developmentPlanId],
      foreignColumns: [mpbcDevelopmentPlan.id],
      name: 'mpbc_player_skill_challenge_development_plan_id_fkey',
    }),
    foreignKey({
      columns: [table.playerId],
      foreignColumns: [mpbcPerson.id],
      name: 'mpbc_player_skill_challenge_player_id_fkey',
    }),
    foreignKey({
      columns: [table.skillTagId],
      foreignColumns: [mpbcSkillTag.id],
      name: 'mpbc_player_skill_challenge_skill_tag_id_fkey',
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [mpbcPerson.id],
      name: 'mpbc_player_skill_challenge_updated_by_fkey',
    }),
    pgPolicy('Allow read for all', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
      using: sql`true`,
    }),
  ]
);

export const infrastructureInvitations = pgTable('infrastructure_invitations', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  teamId: numeric('team_id').notNull(),
  email: text().notNull(),
  role: text().notNull(),
  invitedBy: integer('invited_by').notNull(),
  invitedAt: timestamp('invited_at', { mode: 'string' }).defaultNow().notNull(),
  status: varchar({ length: 20 }).default('pending').notNull(),
});

export const mpbcPracticeTheme = pgTable('mpbc_practice_theme', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text(),
  description: text(),
  category: text(),
  subcategory: text(),
  phaseId: text('phase_id'),
  pillarId: text('pillar_id'),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  comboCode: bigint('combo_code', { mode: 'number' }),
  synonyms: jsonb(),
  useCase: text('use_case'),
  verified: boolean(),
  active: boolean(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  suggestedBy: text('suggested_by'),
  sourceUid: text('source_uid'),
});

export const mpbcPromptTemplates = pgTable('mpbc_prompt_templates', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  promptName: text('prompt_name').notNull(),
  useCase: text('use_case').notNull(),
  promptTemplate: text('prompt_template').notNull(),
  systemInstructions: text('system_instructions'),
  exampleInputs: jsonb('example_inputs'),
  exampleOutputs: jsonb('example_outputs'),
  modelParameters: jsonb('model_parameters'),
  version: text().default('v1.0'),
  active: boolean().default(true),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const mpbcSeason = pgTable(
  'mpbc_season',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    organizationId: uuid('organization_id').notNull(),
    name: text().notNull(),
    year: integer().notNull(),
    term: text(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    description: text(),
    goals: text().array(),
    active: boolean().default(true),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
  },
  table => [
    index('idx_season_dates').using(
      'btree',
      table.startDate.asc().nullsLast().op('date_ops'),
      table.endDate.asc().nullsLast().op('date_ops')
    ),
    index('idx_season_organization_active').using(
      'btree',
      table.organizationId.asc().nullsLast().op('bool_ops'),
      table.active.asc().nullsLast().op('bool_ops')
    ),
    unique('unique_active_season').on(table.organizationId, table.active),
    check('season_check', sql`end_date > start_date`),
    check(
      'season_term_check',
      sql`term = ANY (ARRAY['fall'::text, 'winter'::text, 'spring'::text, 'summer'::text, 'annual'::text])`
    ),
  ]
);

export const mpbcSessionParticipation = pgTable(
  'mpbc_session_participation',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    sessionId: uuid('session_id').notNull(),
    playerId: uuid('player_id').notNull(),
    blocksParticipated: uuid('blocks_participated').array(),
    leadershipDisplayed: text('leadership_displayed').array(),
    effortLevel: integer('effort_level'),
    attitudeRating: integer('attitude_rating'),
    skillDemonstration: text('skill_demonstration').array(),
    areasStruggled: text('areas_struggled').array(),
    coachFeedback: text('coach_feedback'),
    playerSelfAssessment: text('player_self_assessment'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    recordedBy: uuid('recorded_by'),
  },
  table => [
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [mpbcPracticeSession.id],
      name: 'session_participation_session_id_fkey',
    }),
    unique('session_participation_session_id_player_id_key').on(
      table.sessionId,
      table.playerId
    ),
    check(
      'session_participation_attitude_rating_check',
      sql`(attitude_rating >= 1) AND (attitude_rating <= 5)`
    ),
    check(
      'session_participation_effort_level_check',
      sql`(effort_level >= 1) AND (effort_level <= 5)`
    ),
  ]
);

export const mpbcSignalType = pgTable('mpbc_signal_type', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  signalName: text('signal_name').notNull(),
  description: text(),
  category: text(),
  triggerConditions: jsonb('trigger_conditions'),
  recommendedActions: text('recommended_actions').array(),
  priorityLevel: integer('priority_level').default(3),
  autoGenerate: boolean('auto_generate').default(false),
  promptTemplate: text('prompt_template'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const infrastructureActivityLogs = pgTable(
  'infrastructure_activity_logs',
  {
    action: text().notNull(),
    timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    id: uuid().defaultRandom().primaryKey().notNull(),
    personId: uuid('person_id'),
    organizationId: uuid('organization_id'),
  },
  table => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'infrastructure_activity_logs_organization_id_fkey',
    }),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'infrastructure_activity_logs_person_id_fkey',
    }),
  ]
);

export const mpCorePerson = pgTable(
  'mp_core_person',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    displayName: text('display_name').notNull(),
    metadata: jsonb(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    email: text(),
    phone: text(),
    notes: text(),
    personType: text('person_type'),
    organizationId: uuid('organization_id'),
    isAdmin: boolean('is_admin').default(false),
    isSuperadmin: boolean('is_superadmin').default(false),
    active: boolean().default(true),
    dateOfBirth: date('date_of_birth'),
    emergencyContact: jsonb('emergency_contact'),
    profileImageUrl: text('profile_image_url'),
    medicalInfo: jsonb('medical_info'),
    parentGuardianInfo: jsonb('parent_guardian_info'),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    authUid: uuid('auth_uid'),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeProductId: text('stripe_product_id'),
    planName: text('plan_name'),
    subscriptionStatus: text('subscription_status'),
    seatsPurchased: integer('seats_purchased').default(1),
    seatsUsed: integer('seats_used').default(1),
  },
  table => [
    index('idx_mp_core_person_auth_uid').using(
      'btree',
      table.authUid.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_mp_core_person_organization_id').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [table.id],
      name: 'fk_person_created_by',
    }),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'fk_person_organization',
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [table.id],
      name: 'fk_person_updated_by',
    }),
    // TODO: Add foreign key to auth.users when available
    // foreignKey({
    //   columns: [table.authUid],
    //   foreignColumns: [users.id],
    //   name: 'mp_core_person_auth_uid_fkey',
    // }),
    unique('mp_core_person_stripe_customer_id_key').on(table.stripeCustomerId),
    unique('mp_core_person_stripe_customer_id_unique').on(
      table.stripeCustomerId
    ),
    unique('mp_core_person_stripe_subscription_id_key').on(
      table.stripeSubscriptionId
    ),
    unique('mp_core_person_stripe_subscription_id_unique').on(
      table.stripeSubscriptionId
    ),
    pgPolicy('Allow authenticated users to read their own record', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
      using: sql`(auth_uid = auth.uid())`,
    }),
    pgPolicy('Allow authenticated users to insert their own record', {
      as: 'permissive',
      for: 'insert',
      to: ['public'],
    }),
    pgPolicy('Allow authenticated users to update their own record', {
      as: 'permissive',
      for: 'update',
      to: ['public'],
    }),
    pgPolicy('Allow organization admins to read person records', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
    }),
    pgPolicy('Superadmin can select all', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
    }),
    pgPolicy('Superadmin can insert all', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
    }),
    pgPolicy('Allow organization admins to create person records', {
      as: 'permissive',
      for: 'insert',
      to: ['public'],
    }),
    pgPolicy('Allow organization admins to update person records', {
      as: 'permissive',
      for: 'update',
      to: ['public'],
    }),
    pgPolicy('Allow organization admins to delete person records', {
      as: 'permissive',
      for: 'delete',
      to: ['public'],
    }),
    pgPolicy('Superadmin can update all', {
      as: 'permissive',
      for: 'update',
      to: ['authenticated'],
    }),
    pgPolicy('Superadmin can delete all', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
    }),
    pgPolicy('Admin can select all in org', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
    }),
    pgPolicy('Admin can insert in org', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
    }),
    pgPolicy('Admin can update all in org', {
      as: 'permissive',
      for: 'update',
      to: ['authenticated'],
    }),
    pgPolicy('Admin can delete all in org', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
    }),
    pgPolicy('Coach can select own record in org', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
    }),
    pgPolicy('Coach can insert own record in org', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
    }),
  ]
);

export const mpbcTemplateUsageLog = pgTable(
  'mpbc_template_usage_log',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    templateId: uuid('template_id'),
    sessionId: uuid('session_id'),
    organizationId: uuid('organization_id'),
    coachId: uuid('coach_id'),
    attendanceActual: integer('attendance_actual'),
    effectivenessRating: integer('effectiveness_rating'),
    modificationsMade: jsonb('modifications_made'),
    coachFeedback: text('coach_feedback'),
    wouldUseAgain: boolean('would_use_again'),
    usedAt: timestamp('used_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  _table => [
    foreignKey({
      columns: [_table.templateId],
      foreignColumns: [mpbcPracticeTemplatesEnhanced.id],
      name: 'template_usage_log_template_id_fkey',
    }),
  ]
);

export const mpbcSkillPrerequisites = pgTable('mpbc_skill_prerequisites', {
  skillId: text('skill_id'),
  prerequisiteSkillId: text('prerequisite_skill_id'),
  required: boolean(),
  id: uuid().defaultRandom().primaryKey().notNull(),
});

export const mpbcVersionConfig = pgTable('mpbc_version_config', {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  version: text().notNull(),
  schemaVersion: text('schema_version').notNull(),
  promptLibrary: jsonb('prompt_library'),
  constraintDefinitions: jsonb('constraint_definitions'),
  aiModelConfig: jsonb('ai_model_config'),
  active: boolean().default(true),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
});

export const mpbcSkillTag = pgTable('mpbc_skill_tag', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text(),
  description: text(),
  category: text(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  difficultyLevel: bigint('difficulty_level', { mode: 'number' }),
  prerequisites: text(),
  pillarId: text('pillar_id'),
  parentSkillId: text('parent_skill_id'),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  progressionOrder: bigint('progression_order', { mode: 'number' }),
  active: boolean(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  claCategoryMapping: text('cla_category_mapping'),
  intelligenceFocus: text('intelligence_focus'),
  contextRequirements: text('context_requirements'),
});

export const mpbcCorePersonProfile = pgTable(
  'mpbc_core_person_profile',
  {
    personId: uuid('person_id').primaryKey().notNull(),
    organizationId: uuid('organization_id'),
    heightCm: integer('height_cm'),
    dominantHand: text('dominant_hand'),
    playingPosition: text('playing_position'),
    preferredShotZone: text('preferred_shot_zone'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    advancementLevel: text('advancement_level'),
    responsibilityTier: text('responsibility_tier'),
    basketballProfile: jsonb('basketball_profile'),
  },
  _table => [
    index('idx_mpbc_core_person_profile_org_id').using(
      'btree',
      _table.organizationId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [_table.organizationId],
      foreignColumns: [mpCoreOrganizations.id],
      name: 'mpbc_core_person_profile_organization_id_fkey',
    }),
    foreignKey({
      columns: [_table.personId],
      foreignColumns: [mpCorePerson.id],
      name: 'mpbc_core_person_profile_person_id_fkey',
    }).onDelete('cascade'),
  ]
);

export const vMpCoreGroupMembership = pgView('v_mp_core_group_membership', {
  id: uuid(),
  groupId: uuid('group_id'),
  personId: uuid('person_id'),
  role: text(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
}).as(
  sql`SELECT mp_core_person_group.id, mp_core_person_group.group_id, mp_core_person_group.person_id, mp_core_person_group.role, mp_core_person_group.created_at, mp_core_person_group.updated_at FROM mp_core_person_group`
);

export const currentParticipants = pgView('current_participants', {
  id: uuid(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text(),
  personType: text('person_type'),
  authUid: uuid('auth_uid'),
  groupId: uuid('group_id'),
  groupName: text('group_name'),
  role: text(),
  position: text(),
  identifier: text(),
  cycleName: text('cycle_name'),
  organizationId: uuid('organization_id'),
})
  .with({ securityInvoker: true })
  .as(
    sql`SELECT p.id, p.first_name, p.last_name, p.email, p.person_type, p.auth_uid, pg.group_id, g.name AS group_name, pg.role, pg."position", pg.identifier, pc.name AS cycle_name, p.organization_id FROM mp_core_person p JOIN mp_core_person_group pg ON p.id = pg.person_id JOIN mp_core_group g ON pg.group_id = g.id LEFT JOIN infrastructure_program_cycle pc ON pg.cycle_id = pc.id WHERE g.active = true`
  );

export const sessionParticipationSummary = pgView(
  'session_participation_summary',
  {
    sessionId: uuid('session_id'),
    date: date(),
    sessionType: text('session_type'),
    groupName: text('group_name'),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    totalTracked: bigint('total_tracked', { mode: 'number' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    presentCount: bigint('present_count', { mode: 'number' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    absentCount: bigint('absent_count', { mode: 'number' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    lateCount: bigint('late_count', { mode: 'number' }),
    attendancePercentage: numeric('attendance_percentage'),
  }
)
  .with({ securityInvoker: true })
  .as(
    sql`SELECT s.id AS session_id, s.date, s.session_type, g.name AS group_name, count(pl.id) AS total_tracked, count( CASE WHEN pl.status = 'present'::text THEN 1 ELSE NULL::integer END) AS present_count, count( CASE WHEN pl.status = 'absent'::text THEN 1 ELSE NULL::integer END) AS absent_count, count( CASE WHEN pl.status = 'late'::text THEN 1 ELSE NULL::integer END) AS late_count, round(count( CASE WHEN pl.status = 'present'::text THEN 1 ELSE NULL::integer END)::numeric / NULLIF(count(pl.id), 0)::numeric * 100::numeric, 2) AS attendance_percentage FROM infrastructure_sessions s JOIN mp_core_group g ON g.id = s.group_id LEFT JOIN infrastructure_participation_log pl ON pl.session_id = s.id GROUP BY s.id, s.date, s.session_type, g.name`
  );
