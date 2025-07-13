import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  uuid,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const mpCorePerson = pgTable('current_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: varchar('email', { length: 255 }).notNull().unique(),
  personType: text('person_type'),
  authUid: text('auth_uid').unique(), // Link to Supabase Auth
  groupId: text('group_id'), // This is just a text field, not a foreign key
  groupName: text('group_name'),
  role: varchar('role', { length: 50 }),
  position: text('position'),
  identifier: text('identifier'),
  cycleName: text('cycle_name'),
  organizationId: uuid('organization_id'),
});

// Note: These tables don't exist in the current database
// Groups are handled as group_id and group_name in current_participants
// Organizations are handled as organization_id in current_participants

// export const mpCoreOrganizations = pgTable('infrastructure_organizations', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   name: text('name').notNull(),
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// });

// export const mpCoreGroup = pgTable('infrastructure_groups', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   name: varchar('name', { length: 100 }).notNull(),
//   organizationId: uuid('organization_id').references(() => mpCoreOrganizations.id),
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// });

// export const mpCorePersonGroup = pgTable('infrastructure_memberships', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   personId: uuid('user_id')
//     .notNull()
//     .references(() => mpCorePerson.id),
//   groupId: uuid('organization_id')
//     .notNull()
//     .references(() => mpCoreGroup.id),
//   role: varchar('role', { length: 50 }).notNull(), // e.g., 'owner', 'admin', 'member'
//   joinedAt: timestamp('created_at').notNull().defaultNow(),
// });

export const activityLogs = pgTable('infrastructure_activity_logs', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id'), // Removed foreign key reference
  personId: uuid('person_id').references(() => mpCorePerson.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('infrastructure_invitations', {
  id: serial('id').primaryKey(),
  groupId: text('team_id'), // Changed to match existing schema
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => mpCorePerson.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const mpbc_observations = pgTable('mpbc_observations', {
  id: uuid('id').primaryKey().defaultRandom(),
  player_id: uuid('player_id'),
  observer_id: uuid('observer_id'),
  skill_tags: text('skill_tags'),
  cla_category: text('cla_category'),
  context: text('context'),
  observation_text: text('observation_text'),
  performance_rating: integer('performance_rating'),
  basketball_specific_metrics: jsonb('basketball_specific_metrics'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
  development_plan_id: uuid('development_plan_id'),
  archived_at: timestamp('archived_at'),
  archived_by: uuid('archived_by'),
  org_id: uuid('org_id'),
  person_id: uuid('person_id'),
  group_id: uuid('group_id'),
  cycle_id: uuid('cycle_id'),
  organization_id: uuid('organization_id'),
  tags: text('tags'),
  observation_date: timestamp('observation_date'),
  updated_by: uuid('updated_by'),
});

export const mpbc_development_plan = pgTable('mpbc_development_plan', {
  id: uuid('id').primaryKey().defaultRandom(),
  player_id: uuid('player_id'),
  group_id: uuid('group_id'),
  season_id: uuid('season_id'),
  title: text('title'),
  objective: text('objective'),
  status: text('status'),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
});

// Relations are simplified since groups and organizations are embedded in current_participants
export const peopleRelations = relations(mpCorePerson, ({ many }) => ({
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  invitedByUser: one(mpCorePerson, {
    fields: [invitations.invitedBy],
    references: [mpCorePerson.id],
    relationName: 'invitedByUser',
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  person: one(mpCorePerson, {
    fields: [activityLogs.personId],
    references: [mpCorePerson.id],
  }),
}));

export type Person = typeof mpCorePerson.$inferSelect;
export type NewPerson = typeof mpCorePerson.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}

// --- AUTO-GENERATED TABLES FROM USER LIST ---

export const infrastructure_dashboard_config = pgTable('infrastructure_dashboard_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  person_id: uuid('person_id'),
  dashboard_type: text('dashboard_type'),
  widget_config: jsonb('widget_config'),
  is_default: boolean('is_default'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
  organization_id: uuid('organization_id'),
});

export const infrastructure_file_storage = pgTable('infrastructure_file_storage', {
  id: uuid('id').primaryKey().defaultRandom(),
  file_name: text('file_name'),
  original_name: text('original_name'),
  file_path: text('file_path'),
  file_type: text('file_type'),
  file_size: integer('file_size'),
  bucket_name: text('bucket_name'),
  entity_type: text('entity_type'),
  entity_id: uuid('entity_id'),
  uploaded_by: uuid('uploaded_by'),
  description: text('description'),
  tags: text('tags'),
  public_access: boolean('public_access'),
  thumbnail_path: text('thumbnail_path'),
  processing_status: text('processing_status'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at'),
  organization_id: uuid('organization_id'),
});

export const infrastructure_invitations = pgTable('infrastructure_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  team_id: uuid('team_id'),
  email: text('email'),
  role: text('role'),
  invited_by: uuid('invited_by'),
  invited_at: timestamp('invited_at'),
  status: text('status'),
});

export const infrastructure_invites = pgTable('infrastructure_invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email'),
  organization_id: uuid('organization_id'),
  role: text('role'),
  status: text('status'),
  created_at: timestamp('created_at'),
});

export const infrastructure_memberships = pgTable('infrastructure_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id'),
  organization_id: uuid('organization_id'),
  role: text('role'),
  created_at: timestamp('created_at'),
});

export const infrastructure_notification_queue = pgTable('infrastructure_notification_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipient_id: uuid('recipient_id'),
  notification_type: text('notification_type'),
  subject: text('subject'),
  message: text('message'),
  data: jsonb('data'),
  priority: text('priority'),
  status: text('status'),
  scheduled_for: timestamp('scheduled_for'),
  sent_at: timestamp('sent_at'),
  error_message: text('error_message'),
  retry_count: integer('retry_count'),
  created_at: timestamp('created_at'),
  organization_id: uuid('organization_id'),
});

export const infrastructure_participation_log = pgTable('infrastructure_participation_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  session_id: uuid('session_id'),
  person_id: uuid('person_id'),
  status: text('status'),
  arrival_time: timestamp('arrival_time'),
  departure_time: timestamp('departure_time'),
  participation_level: text('participation_level'),
  energy_level: integer('energy_level'),
  focus_level: integer('focus_level'),
  notes: text('notes'),
  absence_reason: text('absence_reason'),
  advance_notice: boolean('advance_notice'),
  makeup_required: boolean('makeup_required'),
  metadata: jsonb('metadata'),
  recorded_at: timestamp('recorded_at'),
  recorded_by: uuid('recorded_by'),
  organization_id: uuid('organization_id'),
});

export const infrastructure_program_cycle = pgTable('infrastructure_program_cycle', {
  id: uuid('id').primaryKey().defaultRandom(),
  organization_id: uuid('organization_id'),
  name: text('name'),
  year: integer('year'),
  term: text('term'),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  description: text('description'),
  objectives: text('objectives'),
  active: boolean('active'),
  created_at: timestamp('created_at'),
  created_by: uuid('created_by'),
});

export const infrastructure_sessions = pgTable('infrastructure_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  group_id: uuid('group_id'),
  cycle_id: uuid('cycle_id'),
  session_number: integer('session_number'),
  session_type: text('session_type'),
  date: timestamp('date'),
  start_time: timestamp('start_time'),
  end_time: timestamp('end_time'),
  location: text('location'),
  session_objective: text('session_objective'),
  pre_session_notes: text('pre_session_notes'),
  post_session_notes: text('post_session_notes'),
  facilitator_reflection: text('facilitator_reflection'),
  intensity_level: text('intensity_level'),
  status: text('status'),
  expected_attendance: integer('expected_attendance'),
  actual_attendance: integer('actual_attendance'),
  conditions: text('conditions'),
  equipment_issues: text('equipment_issues'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
  created_by: uuid('created_by'),
  updated_by: uuid('updated_by'),
  organization_id: uuid('organization_id'),
});

export const infrastructure_system_settings = pgTable('infrastructure_system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  organization_id: uuid('organization_id'),
  category: text('category'),
  setting_key: text('setting_key'),
  setting_value: text('setting_value'),
  description: text('description'),
  data_type: text('data_type'),
  is_public: boolean('is_public'),
  requires_restart: boolean('requires_restart'),
  last_changed_by: uuid('last_changed_by'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
});
