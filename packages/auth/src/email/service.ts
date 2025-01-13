import { Unsend } from "unsend";
import { getPasswordResetEmailTemplate } from "./templates/reset-password";
import { getVerificationEmailTemplate } from "./templates/verification";

let unsend: Unsend | null = null;

export function isEmailServiceConfigured(): boolean {
  const configured = Boolean(process.env.UNSEND_API_KEY);
  if (!configured) {
    const message = isDevelopmentMode()
      ? "Development mode: Email service not configured - verification will be skipped"
      : "Production mode: Email service not configured - this is required for production";
    console.log(message);
    if (!isDevelopmentMode()) {
      throw new Error("Email service must be configured in production");
    }
  }
  return configured;
}

export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === "development";
}

function initializeUnsend(): void {
  if (!unsend && process.env.UNSEND_API_KEY) {
    try {
      unsend = new Unsend(
        process.env.UNSEND_API_KEY,
        "https://mails.zephyyrr.in"
      );
    } catch (error) {
      console.error("Failed to initialize Unsend:", error);
      throw new Error("Email service initialization failed");
    }
  }
}

const SENDER = "zephyyrr.in";

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://development.zephyyrr.in";
}

interface EmailResult {
  success: boolean;
  error?: string;
  skipped?: boolean;
  verificationUrl?: string;
  message?: string;
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<EmailResult> {
  if (isDevelopmentMode() && !isEmailServiceConfigured()) {
    console.log("Development mode: Skipping email verification");
    return {
      success: true,
      skipped: true,
      message: "Email verification skipped in development mode"
    };
  }

  try {
    initializeUnsend();
    // biome-ignore lint/correctness/noUnusedVariables: error is used in the catch block
  } catch (error) {
    return {
      success: false,
      error: "Failed to initialize email service"
    };
  }

  if (!unsend) {
    if (isDevelopmentMode()) {
      return {
        success: true,
        skipped: true,
        error: "Email service not initialized in development mode"
      };
    }
    return {
      success: false,
      error: "Email service not initialized"
    };
  }

  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  if (isDevelopmentMode()) {
    console.log("Development Mode - Verification URL:", verificationUrl);
  }

  try {
    await unsend.emails.send({
      from: `🚀 Zephyr <no-reply@${SENDER}>`,
      to: email,
      subject: "🎉 One Last Step to Join the Zephyr Community!",
      html: getVerificationEmailTemplate(verificationUrl)
    });

    return {
      success: true,
      verificationUrl: isDevelopmentMode() ? verificationUrl : undefined
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred while sending verification email";

    console.error("Error sending verification email:", error);

    return {
      success: false,
      error: errorMessage,
      verificationUrl: isDevelopmentMode() ? verificationUrl : undefined
    };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  try {
    initializeUnsend();

    if (!unsend) {
      throw new Error("Email service not initialized");
    }

    const baseUrl = getBaseUrl().replace(/\/$/, "");
    const resetUrl = `${baseUrl}/reset-password/confirm?token=${token}`;

    if (isDevelopmentMode()) {
      console.log("Reset URL:", resetUrl);
    }

    await unsend.emails.send({
      from: `🔒 Zephyr <no-reply@${SENDER}>`,
      to: email,
      subject: "Reset Your Password",
      html: getPasswordResetEmailTemplate(resetUrl)
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

export function validateEmailServiceConfig(): {
  isValid: boolean;
  message: string;
} {
  if (!process.env.UNSEND_API_KEY) {
    return {
      isValid: false,
      message: isDevelopmentMode()
        ? "Email service not configured (UNSEND_API_KEY missing) - verification will be skipped in development"
        : "Email service configuration required in production mode"
    };
  }

  return {
    isValid: true,
    message: "Email service properly configured"
  };
}
