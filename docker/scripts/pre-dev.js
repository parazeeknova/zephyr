#!/usr/bin/env node

const { execSync } = require("node:child_process");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "../../");

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

async function checkPnpm() {
  try {
    console.log(
      `${colors.blue}📦 Checking pnpm installation...${colors.reset}`
    );
    execSync("pnpm --version", { stdio: "pipe" });
    return true;
  } catch (_error) {
    console.error(`${colors.red}❌ pnpm is not installed${colors.reset}`);
    console.log(`\n${colors.yellow}Installing pnpm globally...${colors.reset}`);

    try {
      execSync("npm install -g pnpm", { stdio: "inherit" });
      console.log(
        `${colors.green}✅ pnpm installed successfully${colors.reset}`
      );
      return true;
    } catch (installError) {
      console.error(
        `${colors.red}Failed to install pnpm:${colors.reset}`,
        installError.message
      );
      console.log("\nPlease install pnpm manually by running:");
      console.log(`${colors.cyan}npm install -g pnpm${colors.reset}`);
      console.log(
        `\nOr follow the installation guide at: ${colors.blue}https://pnpm.io/installation${colors.reset}`
      );
      return false;
    }
  }
}

async function installDependencies() {
  console.log(`${colors.blue}📦 Installing dependencies...${colors.reset}`);
  try {
    execSync("pnpm install --frozen-lockfile", {
      stdio: "inherit",
      cwd: PROJECT_ROOT
    });
    console.log(
      `${colors.green}✅ Dependencies installed successfully${colors.reset}`
    );
    return true;
  } catch (error) {
    console.error(
      `${colors.red}Failed to install dependencies:${colors.reset}`,
      error.message
    );

    try {
      console.log(
        `${colors.yellow}Retrying with regular install...${colors.reset}`
      );
      execSync("pnpm install", {
        stdio: "inherit",
        cwd: PROJECT_ROOT
      });
      console.log(
        `${colors.green}✅ Dependencies installed successfully${colors.reset}`
      );
      return true;
    } catch (retryError) {
      console.error(
        `${colors.red}Failed to install dependencies:${colors.reset}`,
        retryError.message
      );
      return false;
    }
  }
}

async function generatePrisma() {
  console.log(`\n${colors.blue}🔄 Generating Prisma Client...${colors.reset}`);
  try {
    const dbPath = path.join(PROJECT_ROOT, "packages/db");
    execSync("pnpm prisma generate", {
      stdio: "inherit",
      cwd: dbPath
    });
    console.log(
      `${colors.green}✅ Prisma Client generated successfully${colors.reset}`
    );
    return true;
  } catch (error) {
    console.error(
      `${colors.red}Failed to generate Prisma Client:${colors.reset}`,
      error.message
    );
    console.log(`\n${colors.yellow}Troubleshooting tips:${colors.reset}`);
    console.log(
      "1. Make sure your schema.prisma file exists in packages/db/prisma"
    );
    console.log("2. Check if @prisma/client is installed in your dependencies");
    console.log("3. Verify that your schema.prisma file is valid");
    return false;
  }
}

async function main() {
  try {
    // Check for pnpm
    const pnpmInstalled = await checkPnpm();
    if (!pnpmInstalled) {
      process.exit(1);
    }

    // Show pnpm version
    const pnpmVersion = execSync("pnpm --version", { encoding: "utf8" }).trim();
    console.log(
      `${colors.green}✓ Using pnpm version:${colors.reset} ${pnpmVersion}`
    );

    // Install dependencies
    const depsInstalled = await installDependencies();
    if (!depsInstalled) {
      process.exit(1);
    }

    // Generate Prisma Client
    const prismaGenerated = await generatePrisma();
    if (!prismaGenerated) {
      process.exit(1);
    }

    console.log(
      `\n${colors.green}✨ Pre-dev setup completed successfully!${colors.reset}`
    );
    console.log(`\n${colors.gray}You can now continue${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  console.log(`\n${colors.yellow}Setup interrupted by user${colors.reset}`);
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  console.error(`${colors.red}Uncaught exception:${colors.reset}`, error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(
    `${colors.red}Unhandled Rejection at:${colors.reset}`,
    promise,
    "reason:",
    reason
  );
  process.exit(1);
});

main().catch((error) => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});
