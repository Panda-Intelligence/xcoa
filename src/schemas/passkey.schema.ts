import { z } from "zod";
import { catchaSchema } from "./catcha.schema";
import { vm } from "@/lib/validation-messages";

export const passkeyEmailSchema = z.object({
  email: z.string().email(vm.email_invalid),
  firstName: z.string().min(2, vm.first_name_min_length(2)).max(255),
  lastName: z.string().min(2, vm.last_name_min_length(2)).max(255),
  captchaToken: catchaSchema,
});

export type PasskeyEmailSchema = z.infer<typeof passkeyEmailSchema>;
