"use server";

import { hash } from "@node-rs/argon2";
import deepEmailValidator from "deep-email-validator";
import * as EmailValidator from "email-validator";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";

import streamServerClient from "@/lib/stream";
import { lucia } from "@zephyr/auth/auth";
import {
  DISPOSABLE_EMAIL_DOMAINS,
  type SignUpValues,
  signUpSchema
} from "@zephyr/auth/validation";
import { prisma } from "@zephyr/db";

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

export async function signUp(
  credentials: SignUpValues
): Promise<{ error?: string; success?: boolean }> {
  try {
    console.log("Starting signup process");
    const { username, email, password } = signUpSchema.parse(credentials);

    console.log("Validating email");
    const emailValidation = await isEmailValid(email);
    console.log("Email validation result:", emailValidation);

    if (!emailValidation.isValid) {
      return {
        error: emailValidation.error || EMAIL_ERRORS.VALIDATION_FAILED,
        success: false
      };
    }

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive"
        }
      }
    });

    if (existingUsername) {
      return {
        error: USERNAME_ERRORS.TAKEN,
        success: false
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive"
        }
      }
    });

    if (existingEmail) {
      return {
        error: EMAIL_ERRORS.ALREADY_EXISTS,
        success: false
      };
    }

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });

    const userId = generateIdFromEntropySize(10);

    // Create user and upsert user in Stream Chat
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

      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username
      });
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Signup error:", error);
    return {
      error: "Something went wrong. Please try again.",
      success: false
    };
  }
}
