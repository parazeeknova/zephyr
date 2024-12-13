import { emailConfig, getEmailStyles } from "../config";

export const getVerificationEmailTemplate = (verificationUrl: string) => {
  const styles = getEmailStyles();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailConfig.templates.verification.subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; background-image: url('${emailConfig.assets.backgroundImage}'); background-size: cover; background-position: center;">
  <div style="${styles.container}">

    <div style="background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px); border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid ${emailConfig.assets.colors.border};">
      <div style="text-align: center; margin-bottom: 32px;">
        <h2 style="${styles.heading}">
          Welcome to 
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
          ✨
        </h2>
        <p style="margin: 0; color: ${emailConfig.assets.colors.text}; font-size: 16px; line-height: 1.6;">
          We're thrilled to have you join our community of innovators and creators!
        </p>
      </div>

      <div style="${styles.card}">
        <div style="text-align: center;">
          <span style="font-size: 48px; margin-bottom: 16px; display: block;">🔐</span>
          <h3 style="margin: 0 0 12px; color: ${emailConfig.assets.colors.textDark}; font-size: 20px; font-weight: 600;">
            Verify Your Email
          </h3>
          <p style="margin: 0 0 24px; color: ${emailConfig.assets.colors.text}; font-size: 15px; line-height: 1.6;">
            Please verify your email address within ${emailConfig.templates.verification.expiryTime} to complete your registration.
          </p>
          <a href="${verificationUrl}" style="${styles.button}">
            ${emailConfig.templates.verification.buttonText}
          </a>
        </div>
      </div>

      <div style="margin: 32px 0;">
        <h3 style="text-align: center; margin: 0 0 24px; color: ${emailConfig.assets.colors.textDark}; font-size: 20px; font-weight: 600;">
          What's Next? 🎯
        </h3>
        <div style="display: grid; gap: 16px;">
          ${emailConfig.assets.features
            .map(
              (feature) => `
            <div style="${styles.card}">
              <div style="display: flex; align-items: center; gap: 16px;">
                <span style="font-size: 32px; padding-right: 8px;">${feature.emoji}</span>
                <div>
                  <h4 style="margin: 0 0 4px; color: ${emailConfig.assets.colors.textDark}; font-size: 18px; font-weight: 600;">
                    ${feature.title}
                  </h4>
                  <p style="margin: 0; color: ${emailConfig.assets.colors.text}; font-size: 14px;">
                    ${feature.description}
                  </p>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <div style="${styles.card}">
        <p style="margin: 0 0 12px; color: ${emailConfig.assets.colors.text}; font-size: 14px; text-align: center;">
          If the button doesn't work, copy and paste this link in your browser:
        </p>
        <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 13px; color: ${emailConfig.assets.colors.primary};">
          ${verificationUrl}
        </div>
      </div>

      <div style="margin: 32px 0;">
        <div style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%); border-radius: 16px; padding: 32px; border: 1px solid ${emailConfig.assets.colors.border};">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 40px; margin-bottom: 16px; display: block;">
              <img src="${emailConfig.social.github.icon}" alt="GitHub" style="height: 48px; width: 48px; filter: invert(48%) sepia(75%) saturate(845%) hue-rotate(346deg) brightness(101%) contrast(93%);">
            </span>
            <h3 style="margin: 0 0 12px; color: ${emailConfig.assets.colors.textDark}; font-size: 22px; font-weight: 700;">
              Join the Open Source Revolution
            </h3>
            <p style="margin: 0 auto; color: ${emailConfig.assets.colors.text}; font-size: 15px; line-height: 1.6; max-width: 500px;">
              ${emailConfig.project.description}
            </p>
          </div>

          <!-- Three buttons side by side in a table for better email compatibility -->
          <table style="width: 100%; max-width: 540px; margin: 0 auto 32px auto; border-collapse: separate; border-spacing: 12px 0;">
            <tr>
              <td style="width: 33.33%; padding: 0;">
                <a href="${emailConfig.project.links.repo}" 
                  style="display: inline-block; width: 100%; text-align: center;
                          background: white; padding: 14px 0; border-radius: 12px; text-decoration: none;
                          color: ${emailConfig.assets.colors.textDark}; font-weight: 600; font-size: 14px;
                          border: 1px solid ${emailConfig.assets.colors.border};
                          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                  <span style="vertical-align: middle;">${emailConfig.project.stats.stars}</span>
                </a>
              </td>
              <td style="width: 33.33%; padding: 0;">
                <a href="${emailConfig.project.links.contribute}" 
                  style="display: inline-block; width: 100%; text-align: center;
                          background: linear-gradient(135deg, ${emailConfig.assets.colors.primary} 0%, ${emailConfig.assets.colors.primaryHover} 100%);
                          padding: 14px 0; border-radius: 12px; text-decoration: none;
                          color: white; font-weight: 600; font-size: 14px;
                          border: none;
                          box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.25);">
                  <span>${emailConfig.project.stats.contribute}</span>
                </a>
              </td>
              <td style="width: 33.33%; padding: 0;">
                <a href="${emailConfig.project.links.discord}" 
                  style="display: inline-block; width: 100%; text-align: center;
                          background: white; padding: 14px 0; border-radius: 12px; text-decoration: none;
                          color: ${emailConfig.assets.colors.textDark}; font-weight: 600; font-size: 14px;
                          border: 1px solid ${emailConfig.assets.colors.border};
                          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                  <span style="vertical-align: middle;">${emailConfig.project.stats.community}</span>
                </a>
              </td>
            </tr>
          </table>

          <div style="margin-top: 8px; padding-top: 24px; border-top: 1px solid rgba(249, 115, 22, 0.2);">
            <p style="margin: 0; color: ${emailConfig.assets.colors.text}; font-size: 14px; text-align: center; font-style: italic; line-height: 1.6;">
              "Great things are never done by one person. They're done by a team of people."
              <span style="display: block; color: ${emailConfig.assets.colors.textLight}; margin-top: 4px; font-size: 13px;">
                - Steve Jobs
              </span>
            </p>
          </div>
        </div>
      </div>

      <div style="${styles.card}">
        <div style="text-align: center;">
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
            <a href="${emailConfig.company.website}" style="color: ${emailConfig.assets.colors.primary}; text-decoration: none; font-size: 14px; margin: 0 12px;">
              Help Center
            </a>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 32px;">
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
