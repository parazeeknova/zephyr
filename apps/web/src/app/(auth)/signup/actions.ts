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
    "We couldn't validate this email address. Please try another.",
  REQUIRED: "Email is required"
};

const USERNAME_ERRORS = {
  TAKEN: "This username is already taken. Please choose another.",
  INVALID: "Username can only contain letters, numbers, and underscores.",
  REQUIRED: "Username is required"
};

const SYSTEM_ERRORS = {
  JWT_SECRET: "System configuration error: JWT_SECRET is not configured",
  USER_ID: "Failed to generate user ID",
  TOKEN: "Failed to generate verification token",
  INVALID_PAYLOAD: "Invalid token payload data"
};

if (!process.env.JWT_SECRET) {
  throw new Error(SYSTEM_ERRORS.JWT_SECRET);
}

async function isEmailValid(email: string) {
  if (!email) {
    return { isValid: false, error: EMAIL_ERRORS.REQUIRED };
  }

  console.log("Starting email validation for:", email);

  if (!EmailValidator.validate(email)) {
    console.log("Basic email validation failed");
    return { isValid: false, error: EMAIL_ERRORS.INVALID_FORMAT };
  }

  try {
    const domain = email.split("@")[1]?.toLowerCase();

    if (!domain) {
      return { isValid: false, error: EMAIL_ERRORS.INVALID_FORMAT };
    }

    if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
      console.log("Disposable email domain detected:", domain);
      return {
        isValid: false,
        error: EMAIL_ERRORS.DISPOSABLE
      };
    }

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
          return { isValid: false, error: EMAIL_ERRORS.INVALID_FORMAT };
        case "disposable":
          return {
            isValid: false,
            error: EMAIL_ERRORS.DISPOSABLE
          };
        case "mx":
          if (!result.validators.mx?.valid) {
            return { isValid: false, error: EMAIL_ERRORS.INVALID_DOMAIN };
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

    if (suspicious.some((word) => domain.includes(word))) {
      console.log("Suspicious email domain detected:", domain);
      return {
        isValid: false,
        error: EMAIL_ERRORS.SUSPICIOUS
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
        return { isValid: false, error: EMAIL_ERRORS.INVALID_DOMAIN };
      }
    } catch (error) {
      console.error("DNS lookup error:", error);
      return { isValid: false, error: EMAIL_ERRORS.INVALID_DOMAIN };
    }

    console.log("Email validation passed");
    return { isValid: true, error: null };
  } catch (error) {
    console.error("Email validation error:", error);
    return { isValid: false, error: EMAIL_ERRORS.VALIDATION_FAILED };
  }
}

export async function resendVerificationEmail(email: string) {
  if (!email) {
    return {
      error: EMAIL_ERRORS.REQUIRED,
      success: false
    };
  }

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

    const existingToken = await prisma.emailVerificationToken.findFirst({
      where: { userId: existingUser.id }
    });

    if (!existingToken) {
      return {
        error: "Verification token not found",
        success: false
      };
    }

    const sentAt = existingToken.createdAt;
    const timeDiff = Date.now() - sentAt.getTime();
    const isOneMinutePassed = timeDiff > 60000;

    if (!isOneMinutePassed) {
      const remainingSeconds = Math.ceil((60000 - timeDiff) / 1000);
      return {
        error: `Please wait ${remainingSeconds} seconds before requesting another email`,
        success: false
      };
    }

    const tokenPayload = {
      userId: existingUser.id,
      email,
      timestamp: Date.now()
    };

    if (!tokenPayload.userId || !tokenPayload.email) {
      throw new Error(SYSTEM_ERRORS.INVALID_PAYLOAD);
    }

    // biome-ignore lint/style/noNonNullAssertion: JWT_SECRET is required
    const newToken = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: "1h"
    });

    if (!newToken) {
      throw new Error(SYSTEM_ERRORS.TOKEN);
    }

    await prisma.emailVerificationToken.update({
      where: { id: existingToken.id },
      data: {
        token: newToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000)
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
      error:
        error instanceof Error
          ? error.message
          : "Failed to resend verification email",
      success: false
    };
  }
}

export async function signUp(
  credentials: SignUpValues
): Promise<{ error?: string; success?: boolean }> {
  try {
    if (!credentials) {
      return {
        error: "No credentials provided",
        success: false
      };
    }

    const validationResult = signUpSchema.safeParse(credentials);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        error: firstError?.message || "Invalid credentials",
        success: false
      };
    }

    const { username, email, password } = validationResult.data;

    if (!username || !email || !password) {
      return {
        error: "All fields are required",
        success: false
      };
    }

    const emailValidation = await isEmailValid(email);
    if (!emailValidation.isValid) {
      return {
        error: emailValidation.error || EMAIL_ERRORS.VALIDATION_FAILED,
        success: false
      };
    }

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

    if (!userId) {
      throw new Error(SYSTEM_ERRORS.USER_ID);
    }

    const tokenPayload = {
      userId,
      email,
      timestamp: Date.now()
    };

    if (!tokenPayload.userId || !tokenPayload.email) {
      throw new Error(SYSTEM_ERRORS.INVALID_PAYLOAD);
    }

    // biome-ignore lint/style/noNonNullAssertion: JWT_SECRET is required
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: "1h"
    });

    if (!token) {
      throw new Error(SYSTEM_ERRORS.TOKEN);
    }

    const streamClient = getStreamClient();

    // @ts-ignore
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
          expiresAt: new Date(Date.now() + 3600000)
        }
      });

      try {
        await streamClient.upsertUser({
          id: userId,
          username,
          name: username
        });
      } catch (streamError) {
        console.error("Failed to create Stream user:", streamError);
      }
    });

    await sendVerificationEmail(email, token);

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      success: false
    };
  }
}
