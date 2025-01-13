import { z } from "zod";
import { DISPOSABLE_EMAIL_DOMAINS } from "./constants";

const requiredString = z.string().trim().min(1, "Required");

export const signUpSchema = z.object({
  email: requiredString
    .email("Please enter a valid email address")
    .refine(
      (email) => {
        const regex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const isValidFormat = regex.test(email);
        const isNotObviouslyFake =
          !email.includes("fake") &&
          !email.includes("temp") &&
          !email.includes("spam") &&
          !email.includes("trash") &&
          !email.includes("junk") &&
          !email.includes("disposable");
        return isValidFormat && isNotObviouslyFake;
      },
      { message: "This email format is not accepted" }
    )
    .refine(
      (email) => {
        const domain = email.split("@")[1]?.toLowerCase();
        return domain ? !DISPOSABLE_EMAIL_DOMAINS.includes(domain) : false;
      },
      { message: "Please use a permanent email address" }
    )
    .refine(
      (email) => {
        const domain = email.split("@")[1]?.toLowerCase();
        const suspicious = [
          "mailbox",
          "temporary",
          "dispose",
          "trash",
          "spam",
          "fake",
          "temp",
          "dump",
          "junk",
          "throw"
        ];
        return !suspicious.some((word) => domain?.includes(word));
      },
      {
        message:
          "This type of email address is not allowed. Please use your regular email"
      }
    ),
  username: requiredString.regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  ),
  password: requiredString
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[@$!%*?&#]/, "Must contain special character")
    .refine(
      (password) => !/(.)\1{2,}/.test(password),
      "Cannot contain repeated characters (3+ times)"
    )
    .refine(
      (password) => !/(?:abc|123|qwe|xyz)/i.test(password),
      "Cannot contain common sequences"
    )
    .refine((password) => {
      const commonWords = ["password", "admin", "user", "login"];
      return !commonWords.some((word) => password.toLowerCase().includes(word));
    }, "Cannot contain common words")
});

export const loginSchema = z.object({
  username: requiredString,
  password: requiredString
});

export const createPostSchema = z.object({
  content: requiredString,
  mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments")
});

export const updateUserProfileSchema = z.object({
  displayName: requiredString,
  bio: z
    .string()
    .max(2000, "Bio must be at most 2000 characters")
    .refine(
      (text) => text.trim().split(/\s+/).filter(Boolean).length <= 400,
      "Bio must not exceed 400 words"
    )
});

export const createCommentSchema = z.object({
  content: requiredString
});

export type SignUpValues = z.infer<typeof signUpSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;
export type CreateCommentValues = z.infer<typeof createCommentSchema>;
