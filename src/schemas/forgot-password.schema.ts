import { z } from "zod";
import { catchaSchema } from "./catcha.schema";
import { vm } from "@/lib/validation-messages";

export const forgotPasswordSchema = z.object({
  email: z.string().email(vm.email_invalid),
  captchaToken: catchaSchema,
});
