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

function printBanner() {
  console.log(colors.cyan);
  console.log(`
███████╗████████╗ █████╗ ██████╗ ████████╗    ██████╗ ███████╗██╗   ██╗
██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝    ██╔══██╗██╔════╝██║   ██║
███████╗   ██║   ███████║██████╔╝   ██║       ██║  ██║█████╗  ██║   ██║
╚════██║   ██║   ██╔══██║██╔══██╗   ██║       ██║  ██║██╔══╝  ╚██╗ ██╔╝
███████║   ██║   ██║  ██║██║  ██║   ██║       ██████╔╝███████╗ ╚████╔╝ 
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝       ╚═════╝ ╚══════╝  ╚═══╝  
[START] Development Environment Launcher
`);
  console.log(colors.reset);
}

async function runScript(scriptName, command) {
  console.log(`\n${colors.blue}🚀 Running ${scriptName}...${colors.reset}`);
  try {
    execSync(command, {
      stdio: "inherit",
      cwd: PROJECT_ROOT
    });
    console.log(
      `${colors.green}✅ ${scriptName} completed successfully${colors.reset}`
    );
    return true;
  } catch (error) {
    console.error(
      `${colors.red}❌ ${scriptName} failed:${colors.reset}`,
      error.message
    );
    return false;
  }
}

async function main() {
  try {
    printBanner();

    console.log(
      `${colors.yellow}🔄 Starting development environment setup...${colors.reset}`
    );

    // Step 1: Run pre-dev script
    const preDevSuccess = await runScript(
      "Pre-dev setup",
      "node docker/scripts/pre-dev.js"
    );
    if (!preDevSuccess) {
      throw new Error("Pre-dev setup failed");
    }

    // Step 2: Run dev-server script
    const devServerSuccess = await runScript(
      "Dev server setup",
      "node docker/scripts/dev-server.js"
    );
    if (!devServerSuccess) {
      throw new Error("Dev server setup failed");
    }

    // Step 3: Run check-env script
    const envCheckSuccess = await runScript(
      "Environment check",
      "node docker/scripts/check-env.js"
    );
    if (!envCheckSuccess) {
      throw new Error("Environment check failed");
    }

    // Step 4: Run pnpm install again
    console.log(
      `\n${colors.blue}📦 Running additional package installation...${colors.reset}`
    );
    const installSuccess = await runScript(
      "Package reinstallation",
      "pnpm install"
    );
    if (!installSuccess) {
      throw new Error("Package reinstallation failed");
    }

    // Step 5: Start development server
    console.log(
      `\n${colors.green}🎉 All preliminary checks passed! Starting development server...${colors.reset}`
    );
  } catch (error) {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
    console.log(
      `\n${colors.yellow}Cleaning up and shutting down services...${colors.reset}`
    );
    try {
      execSync("docker-compose -f docker-compose.dev.yml down", {
        stdio: "inherit",
        cwd: PROJECT_ROOT
      });
    } catch (cleanupError) {
      console.error(
        `${colors.red}Cleanup failed:${colors.reset}`,
        cleanupError.message
      );
    }
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  console.log(
    `\n${colors.yellow}Shutting down development environment...${colors.reset}`
  );
  try {
    execSync("docker-compose -f docker-compose.dev.yml down", {
      stdio: "inherit",
      cwd: PROJECT_ROOT
    });
    console.log(
      `${colors.green}Successfully shut down all services${colors.reset}`
    );
  } catch (error) {
    console.error(
      `${colors.red}Error during shutdown:${colors.reset}`,
      error.message
    );
  }
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
