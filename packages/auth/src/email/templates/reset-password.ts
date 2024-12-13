export const getPasswordResetEmailTemplate = (resetUrl: string) => `
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
`;
