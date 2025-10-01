import { z } from "zod";
import { vm } from "@/lib/validation-messages";

export const signInSchema = z.object({
  email: z.string().email(vm.email_invalid),
  password: z.string().min(8, vm.password_too_short),
});

export type SignInSchema = z.infer<typeof signInSchema>;
