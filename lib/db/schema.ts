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

export const mpCorePerson = pgTable('mp_core_person', {
  id: uuid('id').primaryKey().defaultRandom(),
  displayName: text('display_name'),
  email: varchar('email', { length: 255 }).notNull().unique(),
  authUid: text('auth_uid').unique(), // Link to Supabase Auth
  isSuperadmin: boolean('is_superadmin').default(false),
  organizationId: uuid('organization_id').references(() => mpCoreOrganizations.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const mpCoreOrganizations = pgTable('mp_core_organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const mpCoreGroup = pgTable('mp_core_group', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  organizationId: uuid('organization_id').references(() => mpCoreOrganizations.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const mpCorePersonGroup = pgTable('mp_core_person_group', {
  id: uuid('id').primaryKey().defaultRandom(),
  personId: uuid('person_id')
    .notNull()
    .references(() => mpCorePerson.id),
  groupId: uuid('group_id')
    .notNull()
    .references(() => mpCoreGroup.id),
  role: varchar('role', { length: 50 }).notNull(), // e.g., 'owner', 'admin', 'member'
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => mpCoreOrganizations.id),
  personId: uuid('person_id').references(() => mpCorePerson.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => mpCoreGroup.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => mpCorePerson.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const organizationsRelations = relations(mpCoreOrganizations, ({ many }) => ({
  people: many(mpCorePerson),
  groups: many(mpCoreGroup),
  activityLogs: many(activityLogs),
}));

export const groupsRelations = relations(mpCoreGroup, ({ one, many }) => ({
  organization: one(mpCoreOrganizations, {
    fields: [mpCoreGroup.organizationId],
    references: [mpCoreOrganizations.id],
  }),
  members: many(mpCorePersonGroup),
  invitations: many(invitations),
}));

export const peopleRelations = relations(mpCorePerson, ({ one, many }) => ({
  organization: one(mpCoreOrganizations, {
    fields: [mpCorePerson.organizationId],
    references: [mpCoreOrganizations.id],
  }),
  groupMemberships: many(mpCorePersonGroup),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  group: one(mpCoreGroup, {
    fields: [invitations.groupId],
    references: [mpCoreGroup.id],
  }),
  invitedByUser: one(mpCorePerson, {
    fields: [invitations.invitedBy],
    references: [mpCorePerson.id],
    relationName: 'invitedByUser',
  }),
}));

export const personGroupRelations = relations(mpCorePersonGroup, ({ one }) => ({
  person: one(mpCorePerson, {
    fields: [mpCorePersonGroup.personId],
    references: [mpCorePerson.id],
  }),
  group: one(mpCoreGroup, {
    fields: [mpCorePersonGroup.groupId],
    references: [mpCoreGroup.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  organization: one(mpCoreOrganizations, {
    fields: [activityLogs.organizationId],
    references: [mpCoreOrganizations.id],
  }),
  person: one(mpCorePerson, {
    fields: [activityLogs.personId],
    references: [mpCorePerson.id],
  }),
}));

export type Person = typeof mpCorePerson.$inferSelect;
export type NewPerson = typeof mpCorePerson.$inferInsert;
export type Group = typeof mpCoreGroup.$inferSelect;
export type NewGroup = typeof mpCoreGroup.$inferInsert;
export type PersonGroup = typeof mpCorePersonGroup.$inferSelect;
export type NewPersonGroup = typeof mpCorePersonGroup.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type NewOrganization = typeof mpCoreOrganizations.$inferInsert;
export type GroupWithMembers = Group & {
  members: (PersonGroup & {
    person: Pick<Person, 'id' | 'displayName' | 'email'>;
  })[];
};

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
