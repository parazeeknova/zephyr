import { z } from "zod";

export const DISPOSABLE_EMAIL_DOMAINS = [
  "tempmail.com",
  "temp-mail.org",
  "tempmail.org",
  "temp-mail.com",
  "temporarymail.com",
  "throwawaymail.com",
  "fakemail.com",
  "fakeinbox.com",
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "sharklasers.com",
  "yopmail.com",
  "10minutemail.com",
  "mintemail.com",
  "tempinbox.com",
  "mailnull.com",
  "emailondeck.com",
  "spambox.us",
  "trashmail.com",
  "mailnesia.com",
  "tempmailaddress.com",
  "临时邮件.com",
  "dispostable.com",
  "tempmail.ninja",
  "emailfake.com",
  "temporarymail.org",
  "trash-mail.com",
  "tmpmail.org",
  "tmpmail.net",
  "tmpeml.com"
];
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
  password: requiredString.regex(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Password must include: 8+ characters, uppercase & lowercase letters, number, and special character"
  )
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: requiredString,
  password: requiredString
});

export type LoginValues = z.infer<typeof loginSchema>;

export const createPostSchema = z.object({
  content: requiredString,
  mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments")
});

export const updateUserProfileSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(1000, "Must be at most 1000 characters")
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

export const createCommentSchema = z.object({
  content: requiredString
});
