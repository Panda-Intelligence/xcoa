"use server";

import { z } from "zod";
import { createTeam, deleteTeam, getTeam, getUserTeams, updateTeam } from "@/server/teams";
import { ZSAError, createServerAction } from "zsa";
import { vm } from "@/lib/validation-messages";

// Update team schema
const updateTeamSchema = z.object({
  teamId: z.string().min(1, vm.team_id_required),
  data: z.object({
    name: z.string().min(1, vm.name_required).max(100, vm.name_too_long).optional(),
    description: z.string().max(1000, vm.description_too_long).optional(),
    avatarUrl: z.string().url(vm.invalid_avatar_url).max(600, vm.url_too_long).optional(),
    billingEmail: z.string().email(vm.email_invalid).max(255, vm.email_too_long).optional(),
    settings: z.string().max(10000, vm.settings_too_large).optional(),
  }),
});

const deleteTeamSchema = z.object({
  teamId: z.string().min(1, vm.team_id_required),
});

const getTeamSchema = z.object({
  teamId: z.string().min(1, vm.team_id_required),
});

const createTeamSchema = z.object({
  name: z.string().min(1, vm.name_required).max(100, vm.name_too_long),
  description: z.string().max(1000, vm.description_too_long).optional(),
  avatarUrl: z.string().url(vm.invalid_avatar_url).max(600, vm.url_too_long).optional(),
});

export const createTeamAction = createServerAction()
  .input(createTeamSchema)
  .handler(async ({ input }) => {
    try {
      const result = await createTeam({
        name: input.name,
        description: input.description,
        avatarUrl: input.avatarUrl,
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to create team:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to create team"
      );
    }
  });

/**
 * Update team details server action
 */
export const updateTeamAction = createServerAction()
  .input(updateTeamSchema)
  .handler(async ({ input }) => {
    try {
      const result = await updateTeam({
        teamId: input.teamId,
        data: input.data,
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to update team:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to update team"
      );
    }
  });

/**
 * Delete team server action
 */
export const deleteTeamAction = createServerAction()
  .input(deleteTeamSchema)
  .handler(async ({ input }) => {
    try {
      await deleteTeam(input.teamId);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete team:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to delete team"
      );
    }
  });

/**
 * Get all teams for the current user
 */
export const getUserTeamsAction = createServerAction()
  .handler(async () => {
    try {
      const teams = await getUserTeams();
      return { success: true, data: teams };
    } catch (error) {
      console.error("Failed to get user teams:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to get user teams"
      );
    }
  });

/**
 * Get a team by ID
 */
export const getTeamAction = createServerAction()
  .input(getTeamSchema)
  .handler(async ({ input }) => {
    try {
      const team = await getTeam(input.teamId);
      return { success: true, data: team };
    } catch (error) {
      console.error(`Failed to get team ${input.teamId}:`, error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to get team"
      );
    }
  });
