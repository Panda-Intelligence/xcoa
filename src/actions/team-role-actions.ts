"use server";

import { z } from "zod";
import { createTeamRole, deleteTeamRole, getTeamRoles, updateTeamRole } from "@/server/team-roles";
import { ZSAError, createServerAction } from "zsa";
import { vm } from "@/lib/validation-messages";

// Create role schema
const createRoleSchema = z.object({
  teamId: z.string().min(1, vm.team_id_required),
  name: z.string().min(1, vm.name_required).max(255, vm.name_too_long),
  description: z.string().max(1000, vm.description_too_long).optional(),
  permissions: z.array(z.string()).min(1, vm.at_least_one_permission),
  metadata: z.record(z.unknown()).optional(),
});

// Update role schema
const updateRoleSchema = z.object({
  teamId: z.string().min(1, vm.team_id_required),
  roleId: z.string().min(1, vm.role_id_required),
  data: z.object({
    name: z.string().min(1, vm.name_required).max(255, vm.name_too_long).optional(),
    description: z.string().max(1000, vm.description_too_long).optional(),
    permissions: z.array(z.string()).min(1, vm.at_least_one_permission).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

const teamIdSchema = z.object({
  teamId: z.string().min(1, vm.team_id_required),
});

const deleteRoleSchema = z.object({
  teamId: z.string().min(1, vm.team_id_required),
  roleId: z.string().min(1, vm.role_id_required),
});

/**
 * Get all roles for a team
 */
export const getTeamRolesAction = createServerAction()
  .input(teamIdSchema)
  .handler(async ({ input }) => {
    try {
      const roles = await getTeamRoles(input.teamId);
      return { success: true, data: roles };
    } catch (error) {
      console.error("Failed to get team roles:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to get team roles"
      );
    }
  });

/**
 * Create a new role for a team
 */
export const createRoleAction = createServerAction()
  .input(createRoleSchema)
  .handler(async ({ input }) => {
    try {
      const result = await createTeamRole({
        teamId: input.teamId,
        name: input.name,
        description: input.description,
        permissions: input.permissions,
        metadata: input.metadata,
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to create role:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to create role"
      );
    }
  });

/**
 * Update an existing team role
 */
export const updateRoleAction = createServerAction()
  .input(updateRoleSchema)
  .handler(async ({ input }) => {
    try {
      const result = await updateTeamRole({
        teamId: input.teamId,
        roleId: input.roleId,
        data: input.data,
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to update role:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to update role"
      );
    }
  });

/**
 * Delete a team role
 */
export const deleteRoleAction = createServerAction()
  .input(deleteRoleSchema)
  .handler(async ({ input }) => {
    try {
      await deleteTeamRole({
        teamId: input.teamId,
        roleId: input.roleId,
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete role:", error);

      if (error instanceof ZSAError) {
        throw error;
      }

      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        "Failed to delete role"
      );
    }
  });
