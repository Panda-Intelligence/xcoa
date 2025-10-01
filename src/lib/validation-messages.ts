/**
 * Validation message helper for Zod schemas
 * This allows us to use consistent validation messages in Zod schemas defined outside components
 * 
 * Usage:
 * const schema = z.object({
 *   email: z.string().email(vm.email_invalid).min(1, vm.email_required)
 * });
 */
export const validationMessages = {
  required: 'This field is required',
  email_required: 'Email is required',
  email_invalid: 'Please enter a valid email address',
  email_too_long: 'Email is too long',
  password_required: 'Password is required',
  password_too_short: 'Password must be at least 8 characters',
  passwords_not_match: 'Passwords do not match',
  invalid_url: 'Invalid URL',
  url_too_long: 'URL is too long',
  name_required: 'Name is required',
  name_too_long: 'Name is too long',
  name_too_short: (min: number) => `Name must be at least ${min} characters`,
  team_name_required: 'Team name is required',
  team_name_too_long: 'Team name is too long',
  team_id_required: 'Team ID is required',
  user_id_required: 'User ID is required',
  role_required: 'Role is required',
  role_id_required: 'Role ID is required',
  description_too_long: 'Description is too long',
  first_name_min_length: (min: number) => `First name must be at least ${min} characters`,
  last_name_min_length: (min: number) => `Last name must be at least ${min} characters`,
  invitation_token_required: 'Invitation token is required',
  invitation_id_required: 'Invitation ID is required',
  verification_token_required: 'Verification token is required',
  auth_code_required: 'Authorization code is required',
  state_required: 'State parameter is required',
  captcha_required: 'Please complete the captcha',
  invalid_avatar_url: 'Invalid avatar URL',
  settings_too_large: 'Settings are too large',
  at_least_one_permission: 'At least one permission is required',
  max_length: (max: number) => `Maximum ${max} characters allowed`,
  min_length: (min: number) => `Minimum ${min} characters required`,
};

export const vm = validationMessages;