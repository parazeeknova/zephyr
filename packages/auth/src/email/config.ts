const WEBSITE_URL = "https://development.zephyyrr.in";
const ASSETS_URL =
  "https://github.com/parazeeknova/zephyr/blob/main/apps/web/src/app/assets";

export const emailConfig = {
  company: {
    name: "Zephyr",
    website: WEBSITE_URL,
    supportEmail: process.env.GMAIL_USER || "dev.hashcodes@gmail.com"
  },

  assets: {
    backgroundImage: `${ASSETS_URL}/signup-image.jpg?raw=true`,
    colors: {
      primary: "#f97316",
      primaryHover: "#fb923c",
      secondary: "#1f2937",
      text: "#6b7280",
      textDark: "#1f2937",
      textLight: "#9ca3af",
      border: "#e5e7eb",
      warning: "#9a3412",
      warningBg: "#fff7ed",
      warningBorder: "#ffedd5",
      cardBg: "#f8fafc"
    },
    features: [
      {
        emoji: "🌐 ",
        title: "Unified Social Feed",
        description:
          "Experience all your social media in one place. Zephyr seamlessly aggregates content from Twitter, Reddit, 4chan, and more into a single, customizable feed. No more platform hopping!"
      },
      {
        emoji: "⚡ ",
        title: "Streamlined Experience",
        description:
          "Take control of your social media consumption with powerful filters, custom categories, and real-time updates. Save time and never miss important content from your favorite platforms."
      },
      {
        emoji: "🐙 ",
        title: "Open Source Freedom",
        description:
          "Zephyr is proudly Free and Open Source Software (FOSS). Inspect the code, suggest features, contribute improvements, and help build a more connected social media experience for everyone. More eyes make for better software!"
      }
    ]
  },

  social: {
    github: {
      url: "https://github.com/parazeeknova/zephyr",
      icon: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
    },
    discord: {
      url: "https://discordapp.com/users/parazeeknova",
      icon: "https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg"
    }
  },

  legal: {
    privacy: {
      url: `${WEBSITE_URL}/privacy`,
      text: "Privacy Policy"
    },
    terms: {
      url: `${WEBSITE_URL}/toc`,
      text: "Terms of Service"
    },
    unsubscribe: {
      url: `${WEBSITE_URL}/soon`,
      text: "Unsubscribe"
    }
  },

  templates: {
    verification: {
      subject: "🎉 One Last Step to Join the Zephyr Community!",
      buttonText: "Verify Email Address",
      expiryTime: "1 hour"
    },
    passwordReset: {
      subject: "Reset Your Password",
      buttonText: "Reset Password",
      expiryTime: "1 hour"
    }
  },

  project: {
    description:
      "Zephyr is a social media aggregator that aggregates content from various social media platforms and displays them in a single feed. Completely FOSS and open to contributions.",
    stats: {
      stars: "⭐ Star on GitHub",
      contribute: "🛠️ Contribute",
      community: "👥 Join Community"
    },
    links: {
      repo: "https://github.com/parazeeknova/zephyr",
      contribute: "https://github.com/parazeeknova/zephyr/contribute",
      discord: "https://discordapp.com/users/parazeeknova"
    }
  }
};

export const getEmailStyles = () => ({
  container: `
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
    padding: 40px 20px;
  `,
  button: `
    display: inline-block;
    background: linear-gradient(135deg, ${emailConfig.assets.colors.primary} 0%, ${emailConfig.assets.colors.primaryHover} 100%);
    color: white;
    text-decoration: none;
    padding: 16px 40px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.25);
  `,
  heading: `
    margin: 0 0 12px;
    color: ${emailConfig.assets.colors.textDark};
    font-size: 24px;
    font-weight: 600;
  `,
  card: `
    padding: 24px;
    border-radius: 16px;
    background: ${emailConfig.assets.colors.cardBg};
    border: 1px solid ${emailConfig.assets.colors.border};
    margin-bottom: 16px;
  `
});
