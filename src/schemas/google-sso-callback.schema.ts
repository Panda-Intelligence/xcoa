import { z } from "zod";
import { vm } from "@/lib/validation-messages";

export const googleSSOCallbackSchema = z.object({
  code: z.string().min(1, vm.auth_code_required),
  state: z.string().min(1, vm.state_required),
});
