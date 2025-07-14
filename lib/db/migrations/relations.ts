import { relations } from 'drizzle-orm/relations';
import {
  mpbcGroup,
  mpbcPersonGroup,
  mpbcPerson,
  mpCorePerson,
  mpCoreOrganizations,
  infrastructureInvites,
  infrastructureMemberships,
  usersInAuth,
  mpCorePersonRole,
  mpCoreGroup,
  mpCoreIntentions,
  infrastructureParticipationLog,
  infrastructureSessions,
  infrastructureProgramCycle,
  mpCorePersonGroup,
  mpCoreActions,
  mpCoreReflections,
  mpbcPersonRole,
  mpbcDevelopmentPlan,
  mpbcSeason,
  infrastructureSystemSettings,
  infrastructureDashboardConfig,
  infrastructureFileStorage,
  infrastructureNotificationQueue,
  mpbcObservations,
  mpbcPlayerSkillChallenge,
  mpbcSkillTag,
  mpbcPracticeSession,
  mpbcSessionParticipation,
  infrastructureActivityLogs,
  mpbcPracticeTemplatesEnhanced,
  mpbcTemplateUsageLog,
  mpbcCorePersonProfile,
} from './schema';

export const mpbcPersonGroupRelations = relations(
  mpbcPersonGroup,
  ({ one }) => ({
    mpbcGroup: one(mpbcGroup, {
      fields: [mpbcPersonGroup.groupId],
      references: [mpbcGroup.id],
    }),
    mpbcPerson: one(mpbcPerson, {
      fields: [mpbcPersonGroup.personId],
      references: [mpbcPerson.id],
    }),
  })
);

export const mpbcGroupRelations = relations(mpbcGroup, ({ one, many }) => ({
  mpbcPersonGroups: many(mpbcPersonGroup),
  mpCoreGroup: one(mpCoreGroup, {
    fields: [mpbcGroup.mpCoreGroupId],
    references: [mpCoreGroup.id],
  }),
  mpbcPerson: one(mpbcPerson, {
    fields: [mpbcGroup.leadPersonId],
    references: [mpbcPerson.id],
  }),
}));

export const mpbcPersonRelations = relations(mpbcPerson, ({ one, many }) => ({
  mpbcPersonGroups: many(mpbcPersonGroup),
  mpCorePerson_mpCorePersonId: one(mpCorePerson, {
    fields: [mpbcPerson.mpCorePersonId],
    references: [mpCorePerson.id],
    relationName: 'mpbcPerson_mpCorePersonId_mpCorePerson_id',
  }),
  mpCorePerson_id: one(mpCorePerson, {
    fields: [mpbcPerson.id],
    references: [mpCorePerson.id],
    relationName: 'mpbcPerson_id_mpCorePerson_id',
  }),
  mpbcDevelopmentPlans_personId: many(mpbcDevelopmentPlan, {
    relationName: 'mpbcDevelopmentPlan_personId_mpbcPerson_id',
  }),
  mpbcDevelopmentPlans_playerId: many(mpbcDevelopmentPlan, {
    relationName: 'mpbcDevelopmentPlan_playerId_mpbcPerson_id',
  }),
  mpbcObservations_personId: many(mpbcObservations, {
    relationName: 'mpbcObservations_personId_mpbcPerson_id',
  }),
  mpbcObservations_observerId: many(mpbcObservations, {
    relationName: 'mpbcObservations_observerId_mpbcPerson_id',
  }),
  mpbcObservations_playerId: many(mpbcObservations, {
    relationName: 'mpbcObservations_playerId_mpbcPerson_id',
  }),
  mpbcGroups: many(mpbcGroup),
  mpbcPlayerSkillChallenges_createdBy: many(mpbcPlayerSkillChallenge, {
    relationName: 'mpbcPlayerSkillChallenge_createdBy_mpbcPerson_id',
  }),
  mpbcPlayerSkillChallenges_playerId: many(mpbcPlayerSkillChallenge, {
    relationName: 'mpbcPlayerSkillChallenge_playerId_mpbcPerson_id',
  }),
  mpbcPlayerSkillChallenges_updatedBy: many(mpbcPlayerSkillChallenge, {
    relationName: 'mpbcPlayerSkillChallenge_updatedBy_mpbcPerson_id',
  }),
}));

export const mpCorePersonRelations = relations(
  mpCorePerson,
  ({ one, many }) => ({
    mpbcPeople_mpCorePersonId: many(mpbcPerson, {
      relationName: 'mpbcPerson_mpCorePersonId_mpCorePerson_id',
    }),
    mpbcPeople_id: many(mpbcPerson, {
      relationName: 'mpbcPerson_id_mpCorePerson_id',
    }),
    mpCorePersonRoles_createdBy: many(mpCorePersonRole, {
      relationName: 'mpCorePersonRole_createdBy_mpCorePerson_id',
    }),
    mpCorePersonRoles_personId: many(mpCorePersonRole, {
      relationName: 'mpCorePersonRole_personId_mpCorePerson_id',
    }),
    mpCorePersonRoles_personId: many(mpCorePersonRole, {
      relationName: 'mpCorePersonRole_personId_mpCorePerson_id',
    }),
    mpCoreIntentions_personId: many(mpCoreIntentions, {
      relationName: 'mpCoreIntentions_personId_mpCorePerson_id',
    }),
    mpCoreIntentions_personId: many(mpCoreIntentions, {
      relationName: 'mpCoreIntentions_personId_mpCorePerson_id',
    }),
    mpCorePersonGroups_createdBy: many(mpCorePersonGroup, {
      relationName: 'mpCorePersonGroup_createdBy_mpCorePerson_id',
    }),
    mpCorePersonGroups_payerId: many(mpCorePersonGroup, {
      relationName: 'mpCorePersonGroup_payerId_mpCorePerson_id',
    }),
    mpCorePersonGroups_personId: many(mpCorePersonGroup, {
      relationName: 'mpCorePersonGroup_personId_mpCorePerson_id',
    }),
    mpCorePersonGroups_payerId: many(mpCorePersonGroup, {
      relationName: 'mpCorePersonGroup_payerId_mpCorePerson_id',
    }),
    mpCorePersonGroups_payerId: many(mpCorePersonGroup, {
      relationName: 'mpCorePersonGroup_payerId_mpCorePerson_id',
    }),
    mpCorePersonGroups_personId: many(mpCorePersonGroup, {
      relationName: 'mpCorePersonGroup_personId_mpCorePerson_id',
    }),
    mpCoreActions_personId: many(mpCoreActions, {
      relationName: 'mpCoreActions_personId_mpCorePerson_id',
    }),
    mpCoreActions_personId: many(mpCoreActions, {
      relationName: 'mpCoreActions_personId_mpCorePerson_id',
    }),
    mpCoreReflections_personId: many(mpCoreReflections, {
      relationName: 'mpCoreReflections_personId_mpCorePerson_id',
    }),
    mpCoreReflections_personId: many(mpCoreReflections, {
      relationName: 'mpCoreReflections_personId_mpCorePerson_id',
    }),
    mpbcPersonRoles_createdBy: many(mpbcPersonRole, {
      relationName: 'mpbcPersonRole_createdBy_mpCorePerson_id',
    }),
    mpbcPersonRoles_personId: many(mpbcPersonRole, {
      relationName: 'mpbcPersonRole_personId_mpCorePerson_id',
    }),
    mpbcPersonRoles_personId: many(mpbcPersonRole, {
      relationName: 'mpbcPersonRole_personId_mpCorePerson_id',
    }),
    mpCoreGroups_createdBy: many(mpCoreGroup, {
      relationName: 'mpCoreGroup_createdBy_mpCorePerson_id',
    }),
    mpCoreGroups_leadPersonId: many(mpCoreGroup, {
      relationName: 'mpCoreGroup_leadPersonId_mpCorePerson_id',
    }),
    mpCoreGroups_updatedBy: many(mpCoreGroup, {
      relationName: 'mpCoreGroup_updatedBy_mpCorePerson_id',
    }),
    infrastructureActivityLogs: many(infrastructureActivityLogs),
    mpCorePerson_createdBy: one(mpCorePerson, {
      fields: [mpCorePerson.createdBy],
      references: [mpCorePerson.id],
      relationName: 'mpCorePerson_createdBy_mpCorePerson_id',
    }),
    mpCorePeople_createdBy: many(mpCorePerson, {
      relationName: 'mpCorePerson_createdBy_mpCorePerson_id',
    }),
    mpCoreOrganization: one(mpCoreOrganizations, {
      fields: [mpCorePerson.organizationId],
      references: [mpCoreOrganizations.id],
    }),
    mpCorePerson_updatedBy: one(mpCorePerson, {
      fields: [mpCorePerson.updatedBy],
      references: [mpCorePerson.id],
      relationName: 'mpCorePerson_updatedBy_mpCorePerson_id',
    }),
    mpCorePeople_updatedBy: many(mpCorePerson, {
      relationName: 'mpCorePerson_updatedBy_mpCorePerson_id',
    }),
    usersInAuth: one(usersInAuth, {
      fields: [mpCorePerson.authUid],
      references: [usersInAuth.id],
    }),
    mpbcCorePersonProfiles: many(mpbcCorePersonProfile),
  })
);

export const infrastructureInvitesRelations = relations(
  infrastructureInvites,
  ({ one }) => ({
    mpCoreOrganization: one(mpCoreOrganizations, {
      fields: [infrastructureInvites.organizationId],
      references: [mpCoreOrganizations.id],
    }),
  })
);

export const mpCoreOrganizationsRelations = relations(
  mpCoreOrganizations,
  ({ many }) => ({
    infrastructureInvites: many(infrastructureInvites),
    infrastructureMemberships: many(infrastructureMemberships),
    mpCorePersonRoles_organizationId: many(mpCorePersonRole, {
      relationName: 'mpCorePersonRole_organizationId_mpCoreOrganizations_id',
    }),
    mpCorePersonRoles_organizationId: many(mpCorePersonRole, {
      relationName: 'mpCorePersonRole_organizationId_mpCoreOrganizations_id',
    }),
    infrastructureParticipationLogs: many(infrastructureParticipationLog),
    infrastructureSessions: many(infrastructureSessions),
    mpCorePersonGroups_organizationId: many(mpCorePersonGroup, {
      relationName: 'mpCorePersonGroup_organizationId_mpCoreOrganizations_id',
    }),
    mpCorePersonGroups_organizationId: many(mpCorePersonGroup, {
      relationName: 'mpCorePersonGroup_organizationId_mpCoreOrganizations_id',
    }),
    infrastructureProgramCycles: many(infrastructureProgramCycle),
    mpbcPersonRoles_organizationId: many(mpbcPersonRole, {
      relationName: 'mpbcPersonRole_organizationId_mpCoreOrganizations_id',
    }),
    mpbcPersonRoles_organizationId: many(mpbcPersonRole, {
      relationName: 'mpbcPersonRole_organizationId_mpCoreOrganizations_id',
    }),
    infrastructureSystemSettings: many(infrastructureSystemSettings),
    infrastructureDashboardConfigs: many(infrastructureDashboardConfig),
    infrastructureFileStorages: many(infrastructureFileStorage),
    infrastructureNotificationQueues: many(infrastructureNotificationQueue),
    mpCoreGroups: many(mpCoreGroup),
    infrastructureActivityLogs: many(infrastructureActivityLogs),
    mpCorePeople: many(mpCorePerson),
    mpbcCorePersonProfiles: many(mpbcCorePersonProfile),
  })
);

export const infrastructureMembershipsRelations = relations(
  infrastructureMemberships,
  ({ one }) => ({
    mpCoreOrganization: one(mpCoreOrganizations, {
      fields: [infrastructureMemberships.organizationId],
      references: [mpCoreOrganizations.id],
    }),
    usersInAuth: one(usersInAuth, {
      fields: [infrastructureMemberships.userId],
      references: [usersInAuth.id],
    }),
  })
);

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  infrastructureMemberships: many(infrastructureMemberships),
  mpCorePeople: many(mpCorePerson),
}));

export const mpCorePersonRoleRelations = relations(
  mpCorePersonRole,
  ({ one }) => ({
    mpCorePerson_createdBy: one(mpCorePerson, {
      fields: [mpCorePersonRole.createdBy],
      references: [mpCorePerson.id],
      relationName: 'mpCorePersonRole_createdBy_mpCorePerson_id',
    }),
    mpCoreOrganization_organizationId: one(mpCoreOrganizations, {
      fields: [mpCorePersonRole.organizationId],
      references: [mpCoreOrganizations.id],
      relationName: 'mpCorePersonRole_organizationId_mpCoreOrganizations_id',
    }),
    mpCorePerson_personId: one(mpCorePerson, {
      fields: [mpCorePersonRole.personId],
      references: [mpCorePerson.id],
      relationName: 'mpCorePersonRole_personId_mpCorePerson_id',
    }),
    mpCorePerson_personId: one(mpCorePerson, {
      fields: [mpCorePersonRole.personId],
      references: [mpCorePerson.id],
      relationName: 'mpCorePersonRole_personId_mpCorePerson_id',
    }),
    mpCoreOrganization_organizationId: one(mpCoreOrganizations, {
      fields: [mpCorePersonRole.organizationId],
      references: [mpCoreOrganizations.id],
      relationName: 'mpCorePersonRole_organizationId_mpCoreOrganizations_id',
    }),
  })
);

export const mpCoreIntentionsRelations = relations(
  mpCoreIntentions,
  ({ one, many }) => ({
    mpCoreGroup_groupId: one(mpCoreGroup, {
      fields: [mpCoreIntentions.groupId],
      references: [mpCoreGroup.id],
      relationName: 'mpCoreIntentions_groupId_mpCoreGroup_id',
    }),
    mpCorePerson_personId: one(mpCorePerson, {
      fields: [mpCoreIntentions.personId],
      references: [mpCorePerson.id],
      relationName: 'mpCoreIntentions_personId_mpCorePerson_id',
    }),
    mpCorePerson_personId: one(mpCorePerson, {
      fields: [mpCoreIntentions.personId],
      references: [mpCorePerson.id],
      relationName: 'mpCoreIntentions_personId_mpCorePerson_id',
    }),
    mpCoreGroup_groupId: one(mpCoreGroup, {
      fields: [mpCoreIntentions.groupId],
      references: [mpCoreGroup.id],
      relationName: 'mpCoreIntentions_groupId_mpCoreGroup_id',
    }),
    mpCoreActions_intentionId: many(mpCoreActions, {
      relationName: 'mpCoreActions_intentionId_mpCoreIntentions_id',
    }),
    mpCoreActions_intentionId: many(mpCoreActions, {
      relationName: 'mpCoreActions_intentionId_mpCoreIntentions_id',
    }),
    mpCoreReflections_intentionId: many(mpCoreReflections, {
      relationName: 'mpCoreReflections_intentionId_mpCoreIntentions_id',
    }),
    mpCoreReflections_intentionId: many(mpCoreReflections, {
      relationName: 'mpCoreReflections_intentionId_mpCoreIntentions_id',
    }),
  })
);

export const mpCoreGroupRelations = relations(mpCoreGroup, ({ one, many }) => ({
  mpCoreIntentions_groupId: many(mpCoreIntentions, {
    relationName: 'mpCoreIntentions_groupId_mpCoreGroup_id',
  }),
  mpCoreIntentions_groupId: many(mpCoreIntentions, {
    relationName: 'mpCoreIntentions_groupId_mpCoreGroup_id',
  }),
  infrastructureSessions: many(infrastructureSessions),
  mpCorePersonGroups_groupId: many(mpCorePersonGroup, {
    relationName: 'mpCorePersonGroup_groupId_mpCoreGroup_id',
  }),
  mpCorePersonGroups_groupId: many(mpCorePersonGroup, {
    relationName: 'mpCorePersonGroup_groupId_mpCoreGroup_id',
  }),
  mpCoreActions_groupId: many(mpCoreActions, {
    relationName: 'mpCoreActions_groupId_mpCoreGroup_id',
  }),
  mpCoreActions_groupId: many(mpCoreActions, {
    relationName: 'mpCoreActions_groupId_mpCoreGroup_id',
  }),
  mpCoreReflections_groupId: many(mpCoreReflections, {
    relationName: 'mpCoreReflections_groupId_mpCoreGroup_id',
  }),
  mpCoreReflections_groupId: many(mpCoreReflections, {
    relationName: 'mpCoreReflections_groupId_mpCoreGroup_id',
  }),
  mpbcDevelopmentPlans: many(mpbcDevelopmentPlan),
  mpCorePerson_createdBy: one(mpCorePerson, {
    fields: [mpCoreGroup.createdBy],
    references: [mpCorePerson.id],
    relationName: 'mpCoreGroup_createdBy_mpCorePerson_id',
  }),
  mpCorePerson_leadPersonId: one(mpCorePerson, {
    fields: [mpCoreGroup.leadPersonId],
    references: [mpCorePerson.id],
    relationName: 'mpCoreGroup_leadPersonId_mpCorePerson_id',
  }),
  mpCoreOrganization: one(mpCoreOrganizations, {
    fields: [mpCoreGroup.organizationId],
    references: [mpCoreOrganizations.id],
  }),
  mpCorePerson_updatedBy: one(mpCorePerson, {
    fields: [mpCoreGroup.updatedBy],
    references: [mpCorePerson.id],
    relationName: 'mpCoreGroup_updatedBy_mpCorePerson_id',
  }),
  mpbcGroups: many(mpbcGroup),
}));

export const infrastructureParticipationLogRelations = relations(
  infrastructureParticipationLog,
  ({ one }) => ({
    mpCoreOrganization: one(mpCoreOrganizations, {
      fields: [infrastructureParticipationLog.organizationId],
      references: [mpCoreOrganizations.id],
    }),
    infrastructureSession: one(infrastructureSessions, {
      fields: [infrastructureParticipationLog.sessionId],
      references: [infrastructureSessions.id],
    }),
  })
);

export const infrastructureSessionsRelations = relations(
  infrastructureSessions,
  ({ one, many }) => ({
    infrastructureParticipationLogs: many(infrastructureParticipationLog),
    mpCoreGroup: one(mpCoreGroup, {
      fields: [infrastructureSessions.groupId],
      references: [mpCoreGroup.id],
    }),
    infrastructureProgramCycle: one(infrastructureProgramCycle, {
      fields: [infrastructureSessions.cycleId],
      references: [infrastructureProgramCycle.id],
    }),
    mpCoreOrganization: one(mpCoreOrganizations, {
      fields: [infrastructureSessions.organizationId],
      references: [mpCoreOrganizations.id],
    }),
  })
);

export const infrastructureProgramCycleRelations = relations(
  infrastructureProgramCycle,
  ({ one, many }) => ({
    infrastructureSessions: many(infrastructureSessions),
    mpCorePersonGroups: many(mpCorePersonGroup),
    mpCoreOrganization: one(mpCoreOrganizations, {
      fields: [infrastructureProgramCycle.organizationId],
      references: [mpCoreOrganizations.id],
    }),
  })
);

export const mpCorePersonGroupRelations = relations(
  mpCorePersonGroup,
  ({ one }) => ({
    mpCorePerson_createdBy: one(mpCorePerson, {
      fields: [mpCorePersonGroup.createdBy],
      references: [mpCorePerson.id],
      relationName: 'mpCorePersonGroup_createdBy_mpCorePerson_id',
    }),
    mpCoreGroup_groupId: one(mpCoreGroup, {
      fields: [mpCorePersonGroup.groupId],
      references: [mpCoreGroup.id],
      relationName: 'mpCorePersonGroup_groupId_mpCoreGroup_id',
    }),
    mpCoreOrganization_organizationId: one(mpCoreOrganizations, {
      fields: [mpCorePersonGroup.organizationId],
      references: [mpCoreOrganizations.id],
      relationName: 'mpCorePersonGroup_organizationId_mpCoreOrganizations_id',
    }),
    mpCorePerson_payerId: one(mpCorePerson, {
      fields: [mpCorePersonGroup.payerId],
      references: [mpCorePerson.id],
      relationName: 'mpCorePersonGroup_payerId_mpCorePerson_id',
    }),
    mpCorePerson_personId: one(mpCorePerson, {
      fields: [mpCorePersonGroup.personId],
      references: [mpCorePerson.id],
      relationName: 'mpCorePersonGroup_personId_mpCorePerson_id',
    }),
    mpCoreGroup_groupId: one(mpCoreGroup, {
      fields: [mpCorePersonGroup.groupId],
      references: [mpCoreGroup.id],
      relationName: 'mpCorePersonGroup_groupId_mpCoreGroup_id',
    }),
    mpCorePerson_payerId: one(mpCorePerson, {
      fields: [mpCorePersonGroup.payerId],
      references: [mpCorePerson.id],
      relationName: 'mpCorePersonGroup_payerId_mpCorePerson_id',
    }),
    mpCorePerson_payerId: one(mpCorePerson, {
      fields: [mpCorePersonGroup.payerId],
      references: [mpCorePerson.id],
      relationName: 'mpCorePersonGroup_payerId_mpCorePerson_id',
    }),
    mpCorePerson_personId: one(mpCorePerson, {
      fields: [mpCorePersonGroup.personId],
      references: [mpCorePerson.id],
      relationName: 'mpCorePersonGroup_personId_mpCorePerson_id',
    }),
    infrastructureProgramCycle: one(infrastructureProgramCycle, {
      fields: [mpCorePersonGroup.cycleId],
      references: [infrastructureProgramCycle.id],
    }),
    mpCoreOrganization_organizationId: one(mpCoreOrganizations, {
      fields: [mpCorePersonGroup.organizationId],
      references: [mpCoreOrganizations.id],
      relationName: 'mpCorePersonGroup_organizationId_mpCoreOrganizations_id',
    }),
  })
);

export const mpCoreActionsRelations = relations(
  mpCoreActions,
  ({ one, many }) => ({
    mpCoreGroup_groupId: one(mpCoreGroup, {
      fields: [mpCoreActions.groupId],
      references: [mpCoreGroup.id],
      relationName: 'mpCoreActions_groupId_mpCoreGroup_id',
    }),
    mpCoreIntention_intentionId: one(mpCoreIntentions, {
      fields: [mpCoreActions.intentionId],
      references: [mpCoreIntentions.id],
      relationName: 'mpCoreActions_intentionId_mpCoreIntentions_id',
    }),
    mpCorePerson_personId: one(mpCorePerson, {
      fields: [mpCoreActions.personId],
      references: [mpCorePerson.id],
      relationName: 'mpCoreActions_personId_mpCorePerson_id',
    }),
    mpCoreIntention_intentionId: one(mpCoreIntentions, {
      fields: [mpCoreActions.intentionId],
      references: [mpCoreIntentions.id],
      relationName: 'mpCoreActions_intentionId_mpCoreIntentions_id',
    }),
    mpCorePerson_personId: one(mpCorePerson, {
      fields: [mpCoreActions.personId],
      references: [mpCorePerson.id],
      relationName: 'mpCoreActions_personId_mpCorePerson_id',
    }),
    mpCoreGroup_groupId: one(mpCoreGroup, {
      fields: [mpCoreActions.groupId],
      references: [mpCoreGroup.id],
      relationName: 'mpCoreActions_groupId_mpCoreGroup_id',
    }),
    mpCoreReflections_actionId: many(mpCoreReflections, {
      relationName: 'mpCoreReflections_actionId_mpCoreActions_id',
    }),
    mpCoreReflections_actionId: many(mpCoreReflections, {
      relationName: 'mpCoreReflections_actionId_mpCoreActions_id',
    }),
  })
);

export const mpCoreReflectionsRelations = relations(
  mpCoreReflections,
  ({ one }) => ({
    mpCoreAction_actionId: one(mpCoreActions, {
      fields: [mpCoreReflections.actionId],
      references: [mpCoreActions.id],
      relationName: 'mpCoreReflections_actionId_mpCoreActions_id',
    }),
    mpCoreGroup_groupId: one(mpCoreGroup, {
      fields: [mpCoreReflections.groupId],
      references: [mpCoreGroup.id],
      relationName: 'mpCoreReflections_groupId_mpCoreGroup_id',
    }),
    mpCoreIntention_intentionId: one(mpCoreIntentions, {
      fields: [mpCoreReflections.intentionId],
      references: [mpCoreIntentions.id],
      relationName: 'mpCoreReflections_intentionId_mpCoreIntentions_id',
    }),
    mpCorePerson_personId: one(mpCorePerson, {
      fields: [mpCoreReflections.personId],
      references: [mpCorePerson.id],
      relationName: 'mpCoreReflections_personId_mpCorePerson_id',
    }),
    mpCoreAction_actionId: one(mpCoreActions, {
      fields: [mpCoreReflections.actionId],
      references: [mpCoreActions.id],
      relationName: 'mpCoreReflections_actionId_mpCoreActions_id',
    }),
    mpCoreIntention_intentionId: one(mpCoreIntentions, {
      fields: [mpCoreReflections.intentionId],
      references: [mpCoreIntentions.id],
      relationName: 'mpCoreReflections_intentionId_mpCoreIntentions_id',
    }),
    mpCorePerson_personId: one(mpCorePerson, {
      fields: [mpCoreReflections.personId],
      references: [mpCorePerson.id],
      relationName: 'mpCoreReflections_personId_mpCorePerson_id',
    }),
    mpCoreGroup_groupId: one(mpCoreGroup, {
      fields: [mpCoreReflections.groupId],
      references: [mpCoreGroup.id],
      relationName: 'mpCoreReflections_groupId_mpCoreGroup_id',
    }),
  })
);

export const mpbcPersonRoleRelations = relations(mpbcPersonRole, ({ one }) => ({
  mpCorePerson_createdBy: one(mpCorePerson, {
    fields: [mpbcPersonRole.createdBy],
    references: [mpCorePerson.id],
    relationName: 'mpbcPersonRole_createdBy_mpCorePerson_id',
  }),
  mpCoreOrganization_organizationId: one(mpCoreOrganizations, {
    fields: [mpbcPersonRole.organizationId],
    references: [mpCoreOrganizations.id],
    relationName: 'mpbcPersonRole_organizationId_mpCoreOrganizations_id',
  }),
  mpCoreOrganization_organizationId: one(mpCoreOrganizations, {
    fields: [mpbcPersonRole.organizationId],
    references: [mpCoreOrganizations.id],
    relationName: 'mpbcPersonRole_organizationId_mpCoreOrganizations_id',
  }),
  mpCorePerson_personId: one(mpCorePerson, {
    fields: [mpbcPersonRole.personId],
    references: [mpCorePerson.id],
    relationName: 'mpbcPersonRole_personId_mpCorePerson_id',
  }),
  mpCorePerson_personId: one(mpCorePerson, {
    fields: [mpbcPersonRole.personId],
    references: [mpCorePerson.id],
    relationName: 'mpbcPersonRole_personId_mpCorePerson_id',
  }),
}));

export const mpbcDevelopmentPlanRelations = relations(
  mpbcDevelopmentPlan,
  ({ one, many }) => ({
    mpbcPerson_personId: one(mpbcPerson, {
      fields: [mpbcDevelopmentPlan.personId],
      references: [mpbcPerson.id],
      relationName: 'mpbcDevelopmentPlan_personId_mpbcPerson_id',
    }),
    mpCoreGroup: one(mpCoreGroup, {
      fields: [mpbcDevelopmentPlan.groupId],
      references: [mpCoreGroup.id],
    }),
    mpbcPerson_playerId: one(mpbcPerson, {
      fields: [mpbcDevelopmentPlan.playerId],
      references: [mpbcPerson.id],
      relationName: 'mpbcDevelopmentPlan_playerId_mpbcPerson_id',
    }),
    mpbcSeason: one(mpbcSeason, {
      fields: [mpbcDevelopmentPlan.seasonId],
      references: [mpbcSeason.id],
    }),
    mpbcObservations: many(mpbcObservations),
    mpbcPlayerSkillChallenges: many(mpbcPlayerSkillChallenge),
  })
);

export const mpbcSeasonRelations = relations(mpbcSeason, ({ many }) => ({
  mpbcDevelopmentPlans: many(mpbcDevelopmentPlan),
}));

export const infrastructureSystemSettingsRelations = relations(
  infrastructureSystemSettings,
  ({ one }) => ({
    mpCoreOrganization: one(mpCoreOrganizations, {
      fields: [infrastructureSystemSettings.organizationId],
      references: [mpCoreOrganizations.id],
    }),
  })
);

export const infrastructureDashboardConfigRelations = relations(
  infrastructureDashboardConfig,
  ({ one }) => ({
    mpCoreOrganization: one(mpCoreOrganizations, {
      fields: [infrastructureDashboardConfig.organizationId],
      references: [mpCoreOrganizations.id],
    }),
  })
);

export const infrastructureFileStorageRelations = relations(
  infrastructureFileStorage,
  ({ one }) => ({
    mpCoreOrganization: one(mpCoreOrganizations, {
      fields: [infrastructureFileStorage.organizationId],
      references: [mpCoreOrganizations.id],
    }),
  })
);

export const infrastructureNotificationQueueRelations = relations(
  infrastructureNotificationQueue,
  ({ one }) => ({
    mpCoreOrganization: one(mpCoreOrganizations, {
      fields: [infrastructureNotificationQueue.organizationId],
      references: [mpCoreOrganizations.id],
    }),
  })
);

export const mpbcObservationsRelations = relations(
  mpbcObservations,
  ({ one }) => ({
    mpbcDevelopmentPlan: one(mpbcDevelopmentPlan, {
      fields: [mpbcObservations.developmentPlanId],
      references: [mpbcDevelopmentPlan.id],
    }),
    mpbcPerson_personId: one(mpbcPerson, {
      fields: [mpbcObservations.personId],
      references: [mpbcPerson.id],
      relationName: 'mpbcObservations_personId_mpbcPerson_id',
    }),
    mpbcPerson_observerId: one(mpbcPerson, {
      fields: [mpbcObservations.observerId],
      references: [mpbcPerson.id],
      relationName: 'mpbcObservations_observerId_mpbcPerson_id',
    }),
    mpbcPerson_playerId: one(mpbcPerson, {
      fields: [mpbcObservations.playerId],
      references: [mpbcPerson.id],
      relationName: 'mpbcObservations_playerId_mpbcPerson_id',
    }),
  })
);

export const mpbcPlayerSkillChallengeRelations = relations(
  mpbcPlayerSkillChallenge,
  ({ one }) => ({
    mpbcPerson_createdBy: one(mpbcPerson, {
      fields: [mpbcPlayerSkillChallenge.createdBy],
      references: [mpbcPerson.id],
      relationName: 'mpbcPlayerSkillChallenge_createdBy_mpbcPerson_id',
    }),
    mpbcDevelopmentPlan: one(mpbcDevelopmentPlan, {
      fields: [mpbcPlayerSkillChallenge.developmentPlanId],
      references: [mpbcDevelopmentPlan.id],
    }),
    mpbcPerson_playerId: one(mpbcPerson, {
      fields: [mpbcPlayerSkillChallenge.playerId],
      references: [mpbcPerson.id],
      relationName: 'mpbcPlayerSkillChallenge_playerId_mpbcPerson_id',
    }),
    mpbcSkillTag: one(mpbcSkillTag, {
      fields: [mpbcPlayerSkillChallenge.skillTagId],
      references: [mpbcSkillTag.id],
    }),
    mpbcPerson_updatedBy: one(mpbcPerson, {
      fields: [mpbcPlayerSkillChallenge.updatedBy],
      references: [mpbcPerson.id],
      relationName: 'mpbcPlayerSkillChallenge_updatedBy_mpbcPerson_id',
    }),
  })
);

export const mpbcSkillTagRelations = relations(mpbcSkillTag, ({ many }) => ({
  mpbcPlayerSkillChallenges: many(mpbcPlayerSkillChallenge),
}));

export const mpbcSessionParticipationRelations = relations(
  mpbcSessionParticipation,
  ({ one }) => ({
    mpbcPracticeSession: one(mpbcPracticeSession, {
      fields: [mpbcSessionParticipation.sessionId],
      references: [mpbcPracticeSession.id],
    }),
  })
);

export const mpbcPracticeSessionRelations = relations(
  mpbcPracticeSession,
  ({ many }) => ({
    mpbcSessionParticipations: many(mpbcSessionParticipation),
  })
);

export const infrastructureActivityLogsRelations = relations(
  infrastructureActivityLogs,
  ({ one }) => ({
    mpCoreOrganization: one(mpCoreOrganizations, {
      fields: [infrastructureActivityLogs.organizationId],
      references: [mpCoreOrganizations.id],
    }),
    mpCorePerson: one(mpCorePerson, {
      fields: [infrastructureActivityLogs.personId],
      references: [mpCorePerson.id],
    }),
  })
);

export const mpbcTemplateUsageLogRelations = relations(
  mpbcTemplateUsageLog,
  ({ one }) => ({
    mpbcPracticeTemplatesEnhanced: one(mpbcPracticeTemplatesEnhanced, {
      fields: [mpbcTemplateUsageLog.templateId],
      references: [mpbcPracticeTemplatesEnhanced.id],
    }),
  })
);

export const mpbcPracticeTemplatesEnhancedRelations = relations(
  mpbcPracticeTemplatesEnhanced,
  ({ many }) => ({
    mpbcTemplateUsageLogs: many(mpbcTemplateUsageLog),
  })
);

export const mpbcCorePersonProfileRelations = relations(
  mpbcCorePersonProfile,
  ({ one }) => ({
    mpCoreOrganization: one(mpCoreOrganizations, {
      fields: [mpbcCorePersonProfile.organizationId],
      references: [mpCoreOrganizations.id],
    }),
    mpCorePerson: one(mpCorePerson, {
      fields: [mpbcCorePersonProfile.personId],
      references: [mpCorePerson.id],
    }),
  })
);
