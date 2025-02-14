#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");

const PROJECT_ROOT = path.resolve(__dirname, "../");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m"
};

const REQUIRED_ENVS = {
  database: [
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB",
    "POSTGRES_PORT",
    "POSTGRES_HOST",
    "DATABASE_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING"
  ],
  redis: ["REDIS_PASSWORD", "REDIS_PORT", "REDIS_HOST", "REDIS_URL"],
  minio: [
    "MINIO_ROOT_USER",
    "MINIO_ROOT_PASSWORD",
    "MINIO_BUCKET_NAME",
    "MINIO_PORT",
    "MINIO_CONSOLE_PORT",
    "MINIO_HOST",
    "MINIO_ENDPOINT",
    "NEXT_PUBLIC_MINIO_ENDPOINT",
    "MINIO_ENABLE_OBJECT_LOCKING"
  ],
  application: [
    "JWT_SECRET",
    "NODE_ENV",
    "NEXT_TELEMETRY_DISABLED",
    "TURBO_TELEMERY_DISABLED",
    "JWT_EXPIRES_IN",
    "NEXT_PUBLIC_URL",
    "NEXT_PUBLIC_SITE_URL"
  ]
};

const DB_REQUIRED_ENVS = {
  database: [
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB",
    "POSTGRES_PORT",
    "POSTGRES_HOST",
    "DATABASE_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING"
  ]
};

const OPTIONAL_ENVS = {
  oauth: [
    "TWITTER_CLIENT_ID",
    "TWITTER_CLIENT_SECRET",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET"
  ],
  mail: ["SUPPORT_EMAIL", "UNSEND_API_KEY"],
  chat: ["NEXT_PUBLIC_STREAM_KEY", "STREAM_SECRET"],
  misc: ["CRON_SECRET"]
};

function printBanner() {
  console.log(colors.magenta);
  console.log(`
███████╗███╗   ██╗██╗   ██╗     ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗
██╔════╝████╗  ██║██║   ██║    ██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝
█████╗  ██╔██╗ ██║██║   ██║    ██║     ███████║█████╗  ██║     █████╔╝ 
██╔══╝  ██║╚██╗██║╚██╗ ██╔╝    ██║     ██╔══██║██╔══╝  ██║     ██╔═██╗ 
███████╗██║ ╚████║ ╚████╔╝     ╚██████╗██║  ██║███████╗╚██████╗██║  ██╗
╚══════╝╚═╝  ╚═══╝  ╚═══╝       ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝
[ENV] Environment Variables Checker
`);
  console.log(colors.reset);
}

function checkEnvFile(filePath, location) {
  if (!fs.existsSync(filePath)) {
    console.log(
      `${colors.red}❌ Missing .env file at ${location}${colors.reset}`
    );
    return null;
  }
  return dotenv.parse(fs.readFileSync(filePath));
}

function createStatusTable(results) {
  // biome-ignore lint/correctness/noUnusedVariables: Constants are used in the table
  const tableData = [];
  const maxCategoryLength = 12;
  const maxVarLength = 30;
  const maxStatusLength = 10;

  console.log(
    `\n${colors.gray}┌${"─".repeat(maxCategoryLength)}┬${"─".repeat(
      maxVarLength
    )}┬${"─".repeat(maxStatusLength)}┐${colors.reset}`
  );
  console.log(
    `${colors.gray}│${colors.blue} CATEGORY${" ".repeat(
      maxCategoryLength - 9
    )}${colors.gray}│${colors.blue} VARIABLE${" ".repeat(maxVarLength - 9)}${
      colors.gray
    }│${colors.blue} STATUS${" ".repeat(maxStatusLength - 7)}${colors.gray}│${
      colors.reset
    }`
  );
  console.log(
    `${colors.gray}├${"─".repeat(maxCategoryLength)}┼${"─".repeat(
      maxVarLength
    )}┼${"─".repeat(maxStatusLength)}┤${colors.reset}`
  );

  // biome-ignore lint/complexity/noForEach: This is a simple loop
  results.forEach(({ category, variable, status, message }) => {
    const categoryPadded = category.padEnd(maxCategoryLength);
    const variablePadded = variable.padEnd(maxVarLength);
    const statusColor =
      status === "✓"
        ? colors.green
        : status === "❌"
          ? colors.red
          : colors.yellow;
    const statusSymbol = `${statusColor}${status}${colors.reset}`;

    console.log(
      `${colors.gray}│${colors.reset} ${categoryPadded}${colors.gray}│${
        colors.reset
      } ${variablePadded}${colors.gray}│${
        colors.reset
      } ${statusSymbol}${" ".repeat(maxStatusLength - 2)}${colors.gray}│${
        colors.reset
      }`
    );

    if (message) {
      const messagePadded = `  └─ ${message}`.padEnd(
        maxCategoryLength + maxVarLength + maxStatusLength + 2
      );
      console.log(
        `${colors.gray}│${colors.yellow} ${messagePadded}${colors.gray}│${colors.reset}`
      );
    }
  });

  console.log(
    `${colors.gray}└${"─".repeat(maxCategoryLength)}┴${"─".repeat(
      maxVarLength
    )}┴${"─".repeat(maxStatusLength)}┘${colors.reset}`
  );
}

function validateEnvs(envs, location) {
  console.log(`\n${colors.cyan}📁 Checking ${location}${colors.reset}`);

  let hasErrors = false;
  let hasWarnings = false;
  const results = [];

  if (location.includes("DB")) {
    // biome-ignore lint/complexity/noForEach: REQUIRED
    Object.entries(DB_REQUIRED_ENVS).forEach(([category, variables]) => {
      // biome-ignore lint/complexity/noForEach: REQUIRED
      variables.forEach((variable) => {
        if (envs[variable]) {
          results.push({
            category: category.toUpperCase(),
            variable,
            status: "✓"
          });
        } else {
          results.push({
            category: category.toUpperCase(),
            variable,
            status: "❌"
          });
          hasErrors = true;
        }
      });
    });
  } else {
    // biome-ignore lint/complexity/noForEach: REQUIRED
    Object.entries(REQUIRED_ENVS).forEach(([category, variables]) => {
      // biome-ignore lint/complexity/noForEach: REQUIRED
      variables.forEach((variable) => {
        if (envs[variable]) {
          results.push({
            category: category.toUpperCase(),
            variable,
            status: "✓"
          });
        } else {
          results.push({
            category: category.toUpperCase(),
            variable,
            status: "❌"
          });
          hasErrors = true;
        }
      });
    });

    // biome-ignore lint/complexity/noForEach: REQUIRED
    Object.entries(OPTIONAL_ENVS).forEach(([category, variables]) => {
      // biome-ignore lint/complexity/noForEach: REQUIRED
      variables.forEach((variable) => {
        if (envs[variable]) {
          results.push({
            category: `${category.toUpperCase()} (OPT)`,
            variable,
            status: "✓"
          });
        } else {
          results.push({
            category: `${category.toUpperCase()} (OPT)`,
            variable,
            status: "⚠️",
            message: getWarningMessage(variable)
          });
          hasWarnings = true;
        }
      });
    });
  }

  createStatusTable(results);
  return { hasErrors, hasWarnings };
}

function getWarningMessage(variable) {
  const warnings = {
    UNSEND_API_KEY: "Email functionality will not work",
    SUPPORT_EMAIL: "Support email features will be disabled",
    NEXT_PUBLIC_STREAM_KEY: "Chat features will not work",
    STREAM_SECRET: "Chat features will not work",
    TWITTER_CLIENT_ID: "Twitter login will not work",
    GITHUB_CLIENT_ID: "GitHub login will not work",
    GOOGLE_CLIENT_ID: "Google login will not work",
    CRON_SECRET: "Scheduled tasks will not work (not important in development)"
  };
  return warnings[variable] || "Feature may be limited";
}

async function main() {
  printBanner();

  const locations = [
    { path: path.join(PROJECT_ROOT, "apps/web"), name: "Apps/Web" },
    { path: path.join(PROJECT_ROOT, "packages/db"), name: "Packages/DB" }
  ];

  let hasAnyErrors = false;
  let hasAnyWarnings = false;

  for (const location of locations) {
    const envPath = path.join(location.path, ".env");
    const envs = checkEnvFile(envPath, location.name);

    if (envs) {
      const { hasErrors, hasWarnings } = validateEnvs(envs, location.name);
      hasAnyErrors = hasAnyErrors || hasErrors;
      hasAnyWarnings = hasAnyWarnings || hasWarnings;
    } else {
      hasAnyErrors = true;
    }
  }

  console.log(
    `\n${colors.gray}----------------------------------------${colors.reset}`
  );
  if (hasAnyErrors) {
    console.log(
      `${colors.red}❌ Environment check failed! Please fix the errors above.${colors.reset}`
    );
    process.exit(1);
  } else if (hasAnyWarnings) {
    console.log(
      `${colors.yellow}⚠️  Environment check passed with warnings${colors.reset}`
    );
  } else {
    console.log(
      `${colors.green}✅ All environment variables are properly configured!${colors.reset}`
    );
  }
}

main().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
