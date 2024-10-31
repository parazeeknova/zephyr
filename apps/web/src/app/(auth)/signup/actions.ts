"use server";

import { sendVerificationEmail } from "@/lib/nodemailer";
import { getStreamClient } from "@/lib/stream";
import { hash } from "@node-rs/argon2";
import {
  DISPOSABLE_EMAIL_DOMAINS,
  type SignUpValues,
  signUpSchema
} from "@zephyr/auth/validation";
import { prisma } from "@zephyr/db";
import deepEmailValidator from "deep-email-validator";
import * as EmailValidator from "email-validator";
import jwt from "jsonwebtoken";
import { generateIdFromEntropySize } from "lucia";

interface EmailValidationResult {
  valid: boolean;
  reason: string;
  validators: {
    regex?: { valid: boolean };
    typo?: { valid: boolean; suggestion?: string };
    disposable?: { valid: boolean };
    mx?: { valid: boolean };
  };
}

const EMAIL_ERRORS = {
  DISPOSABLE:
    "This email provider is not allowed. Please use a permanent email address.",
  INVALID_FORMAT: "Please enter a valid email address.",
  INVALID_DOMAIN: "This email domain appears to be invalid.",
  ALREADY_EXISTS: "An account with this email already exists.",
  SUSPICIOUS:
    "This email address appears to be suspicious. Please use a different one.",
  VALIDATION_FAILED:
    "We couldn't validate this email address. Please try another."
};

const USERNAME_ERRORS = {
  TAKEN: "This username is already taken. Please choose another.",
  INVALID: "Username can only contain letters, numbers, and underscores."
};

async function isEmailValid(email: string) {
  console.log("Starting email validation for:", email);

  // Basic format check
  if (!EmailValidator.validate(email)) {
    console.log("Basic email validation failed");
    return { isValid: false, error: "Invalid email format" };
  }

  try {
    const domain = email.split("@")[1]?.toLowerCase();

    // Check for disposable email domains
    if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
      console.log("Disposable email domain detected:", domain);
      return {
        isValid: false,
        error: "Temporary or disposable email addresses are not allowed"
      };
    }

    // Deep validation
    const result = (await deepEmailValidator({
      email,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: false
    })) as EmailValidationResult;

    console.log("Deep validation result:", result);

    if (!result.valid) {
      console.log("Validation failed with reason:", result.reason);

      switch (result.reason) {
        case "regex":
          return { isValid: false, error: "Invalid email format" };
        case "disposable":
          return {
            isValid: false,
            error: "Temporary or disposable email addresses are not allowed"
          };
        case "mx":
          // Only accept if MX records exist
          if (!result.validators.mx?.valid) {
            return { isValid: false, error: "Invalid email domain" };
          }
          break;
        case "typo":
          if (result.validators.typo?.suggestion) {
            return {
              isValid: false,
              error: `Did you mean ${result.validators.typo.suggestion}?`
            };
          }
          break;
      }
    }

    // Additional server-side checks
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

    if (suspicious.some((word) => domain?.includes(word))) {
      console.log("Suspicious email domain detected:", domain);
      return {
        isValid: false,
        error: "This type of email address is not allowed"
      };
    }

    try {
      const { promises: dns } = require("node:dns");
      const hasMx = await dns.resolveMx(domain).then(
        () => true,
        () => false
      );

      if (!hasMx) {
        console.log("No MX records found for domain:", domain);
        return { isValid: false, error: "Invalid email domain" };
      }
    } catch (error) {
      console.error("DNS lookup error:", error);
      return { isValid: false, error: "Unable to verify email domain" };
    }

    console.log("Email validation passed");
    return { isValid: true };
  } catch (error) {
    console.error("Email validation error:", error);
    return { isValid: false, error: "Unable to validate email address" };
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } }
    });
    if (!existingUser) {
      return {
        error: "User not found",
        success: false
      };
    }
    if (existingUser.emailVerified) {
      return {
        error: "Email already verified",
        success: false
      };
    }

    // Check existing verification token
    const existingToken = await prisma.emailVerificationToken.findFirst({
      where: { userId: existingUser.id }
    });
    if (!existingToken) {
      return {
        error: "Verification token not found",
        success: false
      };
    }

    // Check if enough time has passed (1 minute)
    const sentAt = existingToken.createdAt;
    const timeDiff = Date.now() - sentAt.getTime();
    const isOneMinutePassed = timeDiff > 60000; // 1 minute in milliseconds

    if (!isOneMinutePassed) {
      const remainingSeconds = Math.ceil((60000 - timeDiff) / 1000);
      return {
        error: `Please wait ${remainingSeconds} seconds before requesting another email`,
        success: false
      };
    }
    // Generate new token
    const newToken = jwt.sign(
      { userId: existingUser.id, email },
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    await prisma.emailVerificationToken.update({
      where: { id: existingToken.id },
      data: {
        token: newToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
      }
    });
    await sendVerificationEmail(email, newToken);

    return {
      success: true,
      message: "Verification email has been resent"
    };
  } catch (error) {
    console.error("Resend verification email error:", error);
    return {
      error: "Failed to resend verification email. Please try again later.",
      success: false
    };
  }
}

export async function signUp(
  credentials: SignUpValues
): Promise<{ error?: string; success?: boolean }> {
  try {
    const { username, email, password } = signUpSchema.parse(credentials);

    const emailValidation = await isEmailValid(email);
    if (!emailValidation.isValid) {
      return {
        error: emailValidation.error || EMAIL_ERRORS.VALIDATION_FAILED,
        success: false
      };
    }

    // Check for existing users
    const existingUsername = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } }
    });
    if (existingUsername) {
      return { error: USERNAME_ERRORS.TAKEN, success: false };
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } }
    });
    if (existingEmail) {
      return { error: EMAIL_ERRORS.ALREADY_EXISTS, success: false };
    }

    const passwordHash = await hash(password);
    const userId = generateIdFromEntropySize(10);

    // Create verification token
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET!, {
      expiresIn: "1h"
    });

    const streamClient = getStreamClient();

    // Create user with verification token
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: username,
          email,
          passwordHash,
          emailVerified: false
        }
      });

      await tx.emailVerificationToken.create({
        data: {
          token,
          userId,
          expiresAt: new Date(Date.now() + 3600000) // 1 hour
        }
      });

      await streamClient.upsertUser({
        id: userId,
        username,
        name: username
      });
    });

    // Send verification email
    await sendVerificationEmail(email, token);

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      error: "Something went wrong. Please try again.",
      success: false
    };
  }
}
