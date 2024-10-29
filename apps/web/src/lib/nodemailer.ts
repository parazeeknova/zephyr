import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"🚀 Zephyr" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🎉 One Last Step to Join the Zephyr Community!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="background: linear-gradient(45deg, #000014, #1a1a1a); width: 100%; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <div style="text-align: center; padding: 20px 0;">
                <h1 style="margin: 0; font-size: 28px; color: #000014; letter-spacing: 1px;">
                  Welcome to <span style="background: linear-gradient(45deg, #f97316, #fb923c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Zephyr!</span>
                </h1>
                <p style="color: #6b7280; margin-top: 10px;">Where ideas take flight ✨</p>
              </div>

              <!-- Main Content -->
              <div style="background: linear-gradient(to bottom right, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1)); border-radius: 12px; padding: 30px; margin: 20px 0;">
                <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                  Hey there! 👋 We're super excited to have you join our community. Just one quick step to get you started:
                </p>

                <!-- Verification Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(45deg, #f97316, #fb923c); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.25);">
                    Verify My Email
                  </a>
                </div>

                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 24px;">
                  Button not working? Copy and paste this link in your browser:
                </p>
                <div style="background-color: rgba(249, 115, 22, 0.1); padding: 12px; border-radius: 6px; word-break: break-all; font-size: 14px; color: #4b5563;">
                  ${verificationUrl}
                </div>

                <p style="color: #f97316; font-size: 14px; text-align: center; margin-top: 24px;">
                  This link will expire in 1 hour for security reasons.
                </p>
              </div>

              <!-- Help Section -->
              <div style="border-top: 1px solid rgba(249, 115, 22, 0.2); margin-top: 32px; padding-top: 24px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                  Need help? We've got you covered!
                </p>
                <div style="margin-bottom: 24px;">
                  <a href="mailto:${process.env.GMAIL_USER || "dev.hashcodes@gmail.com"}" style="color: #f97316; text-decoration: none; font-size: 14px;">
                    📧 Contact Support
                  </a>
                  <span style="margin: 0 10px; color: #d1d5db;">•</span>
                  <a href="https://github.com/parazeeknova/zephyr" style="color: #f97316; text-decoration: none; font-size: 14px;">
                    👨‍💻 GitHub
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(249, 115, 22, 0.2);">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Made with 🧡 by the Zephyr Team
                </p>
                <div style="margin-top: 12px;">
                  <a href="#" style="margin: 0 8px; color: #f97316; text-decoration: none; font-size: 12px;">Privacy Policy</a>
                  <a href="#" style="margin: 0 8px; color: #f97316; text-decoration: none; font-size: 12px;">Terms of Service</a>
                </div>
              </div>

              <!-- Security Note -->
              <div style="margin-top: 24px; padding: 16px; background-color: rgba(249, 115, 22, 0.05); border-radius: 8px;">
                <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
                  If you didn't create an account with Zephyr, you can safely ignore this email.
                  Someone might have used your email address by mistake.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password/confirm?token=${token}`;

  await transporter.sendMail({
    from: `"Zephyr" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="background: linear-gradient(45deg, #000014, #001033); width: 100%; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <div style="text-align: center; padding: 20px 0;">
                <h1 style="margin: 0; font-size: 28px; color: #f97316;">
                  Reset Your Password
                </h1>
                <p style="color: #6b7280; margin-top: 10px;">We received a request to reset your password</p>
              </div>

              <!-- Main Content -->
              <div style="background: linear-gradient(to bottom right, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1)); border-radius: 12px; padding: 30px; margin: 20px 0;">
                <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                  If you didn't request this, you can safely ignore this email. Otherwise, click the button below to reset your password:
                </p>

                <!-- Reset Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(45deg, #f97316, #fb923c); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.25);">
                    Reset Password
                  </a>
                </div>

                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 24px;">
                  Or copy and paste this link in your browser:
                </p>
                <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 14px; color: #4b5563;">
                  ${resetUrl}
                </div>

                <p style="color: #ef4444; font-size: 14px; text-align: center; margin-top: 24px;">
                  This link will expire in 1 hour for security reasons.
                </p>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  });
}
