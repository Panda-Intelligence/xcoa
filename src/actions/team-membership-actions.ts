"use server";

import { createServerAction, ZSAError } from "zsa";
import { z } from "zod";
import { acceptTeamInvitation, cancelTeamInvitation, getTeamInvitations, getTeamMembers, inviteUserToTeam, removeTeamMember, updateTeamMemberRole, getPendingInvitationsForCurrentUser } from "@/server/team-members";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";
import { vm } from "@/lib/validation-messages";

// Invite user schema
const inviteUserSchema = z.object({
  teamId: z.string().min(1, vm.team_id_required),
  email: z.string().email(vm.email_invalid).max(255, vm.email_too_long),
  roleId: z.string().min(1, vm.role_required),
  isSystemRole: z.boolean().optional().default(true),
});

// Update member role schema
const updateMemberRoleSchema = z.object({
  teamId: z.string().min(1, vm.team_id_required),
  userId: z.string().min(1, vm.user_id_required),
  roleId: z.string().min(1, vm.role_required),
  isSystemRole: z.boolean().optional().default(true),
});

const teamIdSchema = z.object({
  teamId: z.string().min(1, vm.team_id_required),
});

const removeMemberSchema = z.object({
  teamId: z.string().min(1, vm.team_id_required),
  userId: z.string().min(1, vm.user_id_required),
});

const invitationIdSchema = z.object({
  invitationId: z.string().min(1, vm.invitation_id_required),
});

const invitationTokenSchema = z.object({
  token: z.string().min(1, vm.invitation_token_required),
});

/**
 * Invite a user to a team
 */
export const inviteUserAction = createServerAction()
  .input(inviteUserSchema)
  .handler(async ({ input }) => {
    return withRateLimit(
      async () => {
        try {
          const result = await inviteUserToTeam({
            teamId: input.teamId,
            email: input.email,
            roleId: input.roleId,
            isSystemRole: input.isSystemRole,
          });
          return { success: true, data: result };
        } catch (error) {
          console.error("Failed to invite user:", error);

          if (error instanceof ZSAError) {
            throw error;
          }

          throw new ZSAError(
            "INTERNAL_SERVER_ERROR",
            "Failed to invite user"
          );
        }
      },
      RATE_LIMITS.TEAM_INVITE
    );
  });

/**
 * Get team members action
 */
export const getTeamMembersAction = createServerAction()
  .input(teamIdSchema)
  .handler(async ({ input }) => {
    try {
      const members = await getTeamMembers(input.teamId);
      return { success: true, data: members };
    } catch (error) {
      console.error("Failed to get team members:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to get team members"
      );
    }
  });

/**
 * Update a team member's role
 */
export const updateMemberRoleAction = createServerAction()
  .input(updateMemberRoleSchema)
  .handler(async ({ input }) => {
    try {
      await updateTeamMemberRole({
        teamId: input.teamId,
        userId: input.userId,
        roleId: input.roleId,
        isSystemRole: input.isSystemRole,
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to update member role:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to update member role"
      );
    }
  });

/**
 * Remove a team member
 */
export const removeTeamMemberAction = createServerAction()
  .input(removeMemberSchema)
  .handler(async ({ input }) => {
    try {
      await removeTeamMember({
        teamId: input.teamId,
        userId: input.userId,
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to remove team member:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to remove team member"
      );
    }
  });

/**
 * Get pending team invitations
 */
export const getTeamInvitationsAction = createServerAction()
  .input(teamIdSchema)
  .handler(async ({ input }) => {
    try {
      const invitations = await getTeamInvitations(input.teamId);
      return { success: true, data: invitations };
    } catch (error) {
      console.error("Failed to get team invitations:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to get team invitations"
      );
    }
  });

/**
 * Cancel a team invitation
 */
export const cancelInvitationAction = createServerAction()
  .input(invitationIdSchema)
  .handler(async ({ input }) => {
    try {
      await cancelTeamInvitation(input.invitationId);
      return { success: true };
    } catch (error) {
      console.error("Failed to cancel invitation:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to cancel invitation"
      );
    }
  });

/**
 * Accept a team invitation
 */
export const acceptInvitationAction = createServerAction()
  .input(invitationTokenSchema)
  .handler(async ({ input }) => {
    try {
      const result = await acceptTeamInvitation(input.token);
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to accept invitation:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to accept invitation"
      );
    }
  });

/**
 * Get pending team invitations for the current user
 */
export const getPendingInvitationsForCurrentUserAction = createServerAction()
  .handler(async () => {
    try {
      const invitations = await getPendingInvitationsForCurrentUser();
      return { success: true, data: invitations };
    } catch (error) {
      console.error("Failed to get pending team invitations:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to get pending team invitations"
      );
    }
  });
