import { relations } from 'drizzle-orm/relations';
import {
  mpCorePerson,
  mpCorePersonGroup,
  mpCoreGroup,
  mpCoreOrganizations,
  infrastructureActivityLogs,
} from './schema';

// Core person relations
export const mpCorePersonRelations = relations(
  mpCorePerson,
  ({ one, many }) => ({
    // Group memberships
    personGroups: many(mpCorePersonGroup),

    // Organization
    organization: one(mpCoreOrganizations, {
      fields: [mpCorePerson.organizationId],
      references: [mpCoreOrganizations.id],
    }),

    // Activity logs
    activityLogs: many(infrastructureActivityLogs),
  })
);

// Core person group relations
export const mpCorePersonGroupRelations = relations(
  mpCorePersonGroup,
  ({ one }) => ({
    // Person
    person: one(mpCorePerson, {
      fields: [mpCorePersonGroup.personId],
      references: [mpCorePerson.id],
    }),

    // Group
    group: one(mpCoreGroup, {
      fields: [mpCorePersonGroup.groupId],
      references: [mpCoreGroup.id],
    }),

    // Organization
    organization: one(mpCoreOrganizations, {
      fields: [mpCorePersonGroup.organizationId],
      references: [mpCoreOrganizations.id],
    }),
  })
);

// Core group relations
export const mpCoreGroupRelations = relations(mpCoreGroup, ({ one, many }) => ({
  // Group members
  personGroups: many(mpCorePersonGroup),

  // Organization
  organization: one(mpCoreOrganizations, {
    fields: [mpCoreGroup.organizationId],
    references: [mpCoreOrganizations.id],
  }),
}));

// Core organizations relations
export const mpCoreOrganizationsRelations = relations(
  mpCoreOrganizations,
  ({ many }) => ({
    // People in organization
    people: many(mpCorePerson),

    // Groups in organization
    groups: many(mpCoreGroup),

    // Person groups in organization
    personGroups: many(mpCorePersonGroup),

    // Activity logs
    activityLogs: many(infrastructureActivityLogs),
  })
);

// Activity logs relations
export const activityLogsRelations = relations(
  infrastructureActivityLogs,
  ({ one }) => ({
    person: one(mpCorePerson, {
      fields: [infrastructureActivityLogs.personId],
      references: [mpCorePerson.id],
    }),

    organization: one(mpCoreOrganizations, {
      fields: [infrastructureActivityLogs.organizationId],
      references: [mpCoreOrganizations.id],
    }),
  })
);
