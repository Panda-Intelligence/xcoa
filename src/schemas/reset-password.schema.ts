import { z } from "zod";
import { vm } from "@/lib/validation-messages";

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, vm.password_too_short),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: vm.passwords_not_match,
  path: ["confirmPassword"],
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
