import { z } from "zod";
import { vm } from "@/lib/validation-messages";

export const teamInviteSchema = z.object({
  token: z.string().min(1, vm.invitation_token_required),
});
