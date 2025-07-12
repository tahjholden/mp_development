import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  uuid,
  boolean,
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
