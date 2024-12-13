import deepEmailValidator from "deep-email-validator";
import * as EmailValidator from "email-validator";
import { DISPOSABLE_EMAIL_DOMAINS } from "../../validation";

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

export const EMAIL_ERRORS = {
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

export async function isEmailValid(email: string) {
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
          return { isValid: false, error: EMAIL_ERRORS.DISPOSABLE };
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
      return { isValid: false, error: EMAIL_ERRORS.SUSPICIOUS };
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
