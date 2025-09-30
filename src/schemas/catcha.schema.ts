import { z } from "zod";
import { vm } from "@/lib/validation-messages";

const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

export const catchaSchema = turnstileEnabled
  ? z.string().min(1, vm.captcha_required)
  : z.string().optional()
