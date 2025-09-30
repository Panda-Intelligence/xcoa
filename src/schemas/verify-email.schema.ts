import { z } from "zod";
import { vm } from "@/lib/validation-messages";

export const verifyEmailSchema = z.object({
  token: z.string().min(1, vm.verification_token_required),
});
