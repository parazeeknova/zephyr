import { emailConfig, getEmailStyles } from '../config';

export const getPasswordResetEmailTemplate = (resetUrl: string) => {
  const styles = getEmailStyles();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailConfig.templates.passwordReset.subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; background-image: url('${emailConfig.assets.backgroundImage}'); background-size: cover; background-position: center;">
  <div style="${styles.container}">
    <div style="background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px); border-radius: 24px; padding: 48px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid ${emailConfig.assets.colors.border};">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: ${emailConfig.assets.colors.warningBg}; padding: 16px; border-radius: 50%;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="${emailConfig.assets.colors.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <h2 style="${styles.heading}">
          Reset Your 
          <span style="
            background: linear-gradient(135deg, ${emailConfig.assets.colors.primary} 0%, ${emailConfig.assets.colors.primaryHover} 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            display: inline-block;
            margin: 0 4px;
            font-weight: 700;
          ">
            ${emailConfig.company.name}
          </span>
          Password 🔐
        </h2>
        <p style="margin: 0; color: ${emailConfig.assets.colors.text}; font-size: 16px; line-height: 1.6;">
          No worries! We'll help you get back to your account securely.
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <p style="margin: 0 0 20px; color: ${emailConfig.assets.colors.text}; font-size: 15px; line-height: 1.6;">
          Click the button below to reset your password. This link will expire in ${emailConfig.templates.passwordReset.expiryTime}.
        </p>
        <a href="${resetUrl}" style="${styles.button}">
          ${emailConfig.templates.passwordReset.buttonText}
        </a>
      </div>

      <div style="background: ${emailConfig.assets.colors.cardBg}; padding: 20px; border-radius: 12px; margin-bottom: 32px; border: 1px solid ${emailConfig.assets.colors.border};">
        <p style="margin: 0 0 12px; color: ${emailConfig.assets.colors.text}; font-size: 14px; text-align: center;">
          If the button doesn't work, copy and paste this link in your browser:
        </p>
        <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 13px; color: ${emailConfig.assets.colors.primary};">
          ${resetUrl}
        </div>
      </div>

      <div style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%); border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px; color: ${emailConfig.assets.colors.textDark}; font-size: 18px; font-weight: 600; text-align: center;">
          🛡️ Security Tips
        </h3>
        <ul style="margin: 0; padding: 0 0 0 24px; color: ${emailConfig.assets.colors.text}; font-size: 14px; line-height: 1.6;">
          <li style="margin-bottom: 8px;">Create a strong password with a mix of letters, numbers, and symbols</li>
          <li style="margin-bottom: 8px;">Never share your password or account details with anyone</li>
          <li style="margin-bottom: 8px;">Enable two-factor authentication for extra security</li>
        </ul>
      </div>

      <div style="background: ${emailConfig.assets.colors.warningBg}; border: 1px solid ${emailConfig.assets.colors.warningBorder}; border-radius: 12px; padding: 16px; margin-bottom: 32px;">
        <div style="display: flex; align-items: start;">
          <span style="color: ${emailConfig.assets.colors.warning}; font-size: 24px; margin-right: 12px;">⚠️</span>
          <p style="margin: 0; color: ${emailConfig.assets.colors.warning}; font-size: 14px; line-height: 1.5;">
            If you didn't request this password reset, please contact our support team at ${emailConfig.company.supportEmail} immediately.
          </p>
        </div>
      </div>

      <div style="text-align: center; padding: 24px 0; border-top: 1px solid ${emailConfig.assets.colors.border};">
        <h4 style="margin: 0 0 12px; color: ${emailConfig.assets.colors.textDark}; font-size: 18px; font-weight: 600;">
          Need Help? 💁‍♂️
        </h4>
        <p style="margin: 0 0 16px; color: ${emailConfig.assets.colors.text}; font-size: 14px;">
          Our support team is here to help you 24/7
        </p>
        <div>
          <a href="mailto:${emailConfig.company.supportEmail}" style="color: ${emailConfig.assets.colors.primary}; text-decoration: none; font-size: 14px; margin: 0 12px;">
            Contact Support
          </a>
          <span style="color: ${emailConfig.assets.colors.border};">•</span>
          <a href="${emailConfig.company.website}/soon" style="color: ${emailConfig.assets.colors.primary}; text-decoration: none; font-size: 14px; margin: 0 12px;">
            Help Center
          </a>
        </div>
      </div>

      <div style="text-align: center; margin-top: 32px; padding-top: 32px; border-top: 1px solid ${emailConfig.assets.colors.border};">
        <div style="margin-bottom: 16px;">
          <a href="${emailConfig.legal.privacy.url}" style="color: ${emailConfig.assets.colors.text}; text-decoration: none; font-size: 12px; margin: 0 8px;">
            ${emailConfig.legal.privacy.text}
          </a>
          <a href="${emailConfig.legal.terms.url}" style="color: ${emailConfig.assets.colors.text}; text-decoration: none; font-size: 12px; margin: 0 8px;">
            ${emailConfig.legal.terms.text}
          </a>
          <a href="${emailConfig.legal.unsubscribe.url}" style="color: ${emailConfig.assets.colors.text}; text-decoration: none; font-size: 12px; margin: 0 8px;">
            ${emailConfig.legal.unsubscribe.text}
          </a>
        </div>
        <p style="margin: 0; color: ${emailConfig.assets.colors.textLight}; font-size: 12px;">
          © ${new Date().getFullYear()} ${emailConfig.company.name}. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
};
