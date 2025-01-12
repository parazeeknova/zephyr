import { Unsend } from "unsend";
import { getPasswordResetEmailTemplate } from "./templates/reset-password";
import { getVerificationEmailTemplate } from "./templates/verification";

let unsend: Unsend;

const initializeUnsend = () => {
  if (!unsend && process.env.UNSEND_API_KEY) {
    unsend = new Unsend(
      process.env.UNSEND_API_KEY,
      "https://mails.zephyyrr.in"
    );
  } else if (!process.env.UNSEND_API_KEY) {
    console.error("Missing UNSEND_API_KEY environment variable");
  }
};

const SENDER = "zephyyrr.in";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://development.zephyyrr.in";
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  initializeUnsend();
  if (!unsend) {
    throw new Error("Email service not initialized");
  }

  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  console.log("Verification URL:", verificationUrl);

  try {
    await unsend.emails.send({
      from: `🚀 Zephyr <no-reply@${SENDER}>`,
      to: email,
      subject: "🎉 One Last Step to Join the Zephyr Community!",
      html: getVerificationEmailTemplate(verificationUrl)
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  initializeUnsend();
  if (!unsend) {
    throw new Error("Email service not initialized");
  }

  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const resetUrl = `${baseUrl}/reset-password/confirm?token=${token}`;

  console.log("Reset URL:", resetUrl);

  try {
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
