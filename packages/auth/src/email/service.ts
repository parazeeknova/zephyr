import nodemailer from "nodemailer";
import { getPasswordResetEmailTemplate } from "./templates/reset-password";
import { getVerificationEmailTemplate } from "./templates/verification";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  console.log("Verification URL:", verificationUrl);

  await transporter.sendMail({
    from: `"🚀 Zephyr" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🎉 One Last Step to Join the Zephyr Community!",
    html: getVerificationEmailTemplate(verificationUrl)
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const resetUrl = `${baseUrl}/reset-password/confirm?token=${token}`;

  console.log("Reset URL:", resetUrl);

  await transporter.sendMail({
    from: `"Zephyr" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: getPasswordResetEmailTemplate(resetUrl)
  });
}
