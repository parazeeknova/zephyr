export * from "./stream/services";

// Core exports
export { lucia, validateRequest } from "./core/lucia";

// OAuth providers
export { google, github, discord, twitter } from "./providers/oauth";

// Validation exports
export { DISPOSABLE_EMAIL_DOMAINS } from "./validation/constants";
export {
  signUpSchema,
  loginSchema,
  createPostSchema,
  updateUserProfileSchema,
  type SignUpValues,
  type LoginValues,
  type UpdateUserProfileValues
} from "./validation/schemas";

// Email service exports (from previous restructuring)
export { sendVerificationEmail, sendPasswordResetEmail } from "./email/service";
