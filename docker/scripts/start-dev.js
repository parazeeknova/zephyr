#!/usr/bin/env node

const { execSync } = require("node:child_process");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "../../");
const DOCKER_COMPOSE_FILE = "docker-compose.dev.yml";
const SETUP_STEPS = [
  {
    name: "Pre-dev setup",
    command: "node docker/scripts/pre-dev.js",
    errorMessage: "Pre-dev setup failed"
  },
  {
    name: "Dev server setup",
    command: "node docker/scripts/dev-server.js",
    errorMessage: "Dev server setup failed"
  },
  {
    name: "Environment check",
    command: "node docker/scripts/check-env.js",
    errorMessage: "Environment check failed",
    delay: 5000
  },
  {
    name: "Package reinstallation",
    command: "pnpm install",
    errorMessage: "Package reinstallation failed"
  }
];

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

const printBanner = () => {
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
};

const cleanupDocker = () => {
  console.log(
    `\n${colors.yellow}Cleaning up and shutting down services...${colors.reset}`
  );
  try {
    execSync(`docker-compose -f ${DOCKER_COMPOSE_FILE} down`, {
      stdio: "inherit",
      cwd: PROJECT_ROOT
    });
    console.log(
      `${colors.green}Successfully shut down all services${colors.reset}`
    );
  } catch (error) {
    console.error(`${colors.red}Cleanup failed:${colors.reset}`, error.message);
    throw error;
  }
};

const runScript = async (scriptName, command) => {
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
};

async function setupDevelopmentEnvironment() {
  printBanner();
  console.log(
    `${colors.yellow}🔄 Starting development environment setup...${colors.reset}`
  );
  for (const step of SETUP_STEPS) {
    if (step.delay) {
      console.log(
        `\n${colors.blue}⏳ Waiting for services to be ready...${colors.reset}`
      );
      await new Promise((resolve) => setTimeout(resolve, step.delay));
    }

    const success = await runScript(step.name, step.command);
    if (!success) {
      throw new Error(step.errorMessage);
    }
  }

  console.log(
    `\n${colors.green}🎉 All preliminary checks passed! Starting development server...${colors.reset}`
  );
  return true;
}

const setupErrorHandlers = () => {
  process.on("SIGINT", () => {
    console.log(
      `\n${colors.yellow}Shutting down development environment...${colors.reset}`
    );
    cleanupDocker();
    process.exit(0);
  });

  process.on("uncaughtException", (error) => {
    console.error(`${colors.red}Uncaught exception:${colors.reset}`, error);
    cleanupDocker();
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error(
      `${colors.red}Unhandled Rejection at:${colors.reset}`,
      promise,
      "reason:",
      reason
    );
    cleanupDocker();
    process.exit(1);
  });
};

async function main() {
  setupErrorHandlers();

  try {
    await setupDevelopmentEnvironment();
  } catch (error) {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
    await cleanupDocker();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});
