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
  gray: "\x1b[90m",
  dim: "\x1b[2m"
};

function getTerminalWidth() {
  return process.stdout.columns || 80;
}

function centerText(text, padding = 0) {
  const width = getTerminalWidth();
  const lines = text.split("\n");
  return lines
    .map((line) => {
      const spaces = Math.max(0, Math.floor((width - line.length) / 2));
      return " ".repeat(spaces + padding) + line;
    })
    .join("\n");
}

function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[0f");
}

const printBanner = () => {
  clearScreen();
  const banner = `
███████╗████████╗ █████╗ ██████╗ ████████╗    ██████╗ ███████╗██╗   ██╗
██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝    ██╔══██╗██╔════╝██║   ██║
███████╗   ██║   ███████║██████╔╝   ██║       ██║  ██║█████╗  ██║   ██║
╚════██║   ██║   ██╔══██║██╔══██╗   ██║       ██║  ██║██╔══╝  ╚██╗ ██╔╝
███████║   ██║   ██║  ██║██║  ██║   ██║       ██████╔╝███████╗ ╚████╔╝ 
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝       ╚═════╝ ╚══════╝  ╚═══╝  
[START] Development Environment Launcher
`;
  console.log(colors.cyan + centerText(banner) + colors.reset);
  console.log(`${centerText("----------------------------------------")}\n`);
};

const createProgressBar = (progress, width = 40) => {
  const filled = Math.floor((width * progress) / 100);
  const empty = width - filled;
  return `[${colors.blue}${"█".repeat(filled)}${colors.gray}${"░".repeat(empty)}${colors.reset}] ${progress}%`;
};

const cleanupDocker = () => {
  clearScreen();
  console.log(
    centerText(
      `${colors.yellow}Cleaning up and shutting down services...${colors.reset}`
    )
  );
  try {
    execSync(`docker-compose -f ${DOCKER_COMPOSE_FILE} down`, {
      stdio: "inherit",
      cwd: PROJECT_ROOT
    });
    console.log(
      centerText(
        `${colors.green}Successfully shut down all services${colors.reset}`
      )
    );
  } catch (error) {
    console.error(
      centerText(`${colors.red}Cleanup failed:${colors.reset} ${error.message}`)
    );
    throw error;
  }
};

const runScript = async (step, currentStep, totalSteps) => {
  const progress = Math.floor((currentStep / totalSteps) * 100);
  clearScreen();

  console.log(
    centerText(
      `${colors.blue}Step ${currentStep} of ${totalSteps}${colors.reset}`
    )
  );
  console.log(`${centerText(createProgressBar(progress))}\n`);
  console.log(
    centerText(`${colors.yellow}🚀 Running ${step.name}...${colors.reset}\n`)
  );

  try {
    execSync(step.command, {
      stdio: "inherit",
      cwd: PROJECT_ROOT
    });
    console.log(
      centerText(
        `${colors.green}✅ ${step.name} completed successfully${colors.reset}`
      )
    );
    return true;
  } catch (error) {
    console.error(
      centerText(`${colors.red}❌ ${step.name} failed:${colors.reset}`)
    );
    console.error(centerText(error.message));
    return false;
  }
};

async function setupDevelopmentEnvironment() {
  printBanner();
  console.log(
    centerText(
      `${colors.yellow}🔄 Starting development environment setup...${colors.reset}\n`
    )
  );

  const totalSteps = SETUP_STEPS.length;

  for (let i = 0; i < SETUP_STEPS.length; i++) {
    const step = SETUP_STEPS[i];

    if (step.delay) {
      clearScreen();
      console.log(
        centerText(
          `${colors.blue}⏳ Waiting for services to be ready...${colors.reset}`
        )
      );
      await new Promise((resolve) => setTimeout(resolve, step.delay));
    }

    const success = await runScript(step, i + 1, totalSteps);
    if (!success) {
      throw new Error(step.errorMessage);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  clearScreen();
  console.log(
    centerText(
      `${colors.green}🎉 All preliminary checks passed!${colors.reset}`
    )
  );
  console.log(`${centerText(createProgressBar(100))}\n`);
  console.log(
    centerText(`${colors.blue}Starting development server...${colors.reset}`)
  );
  return true;
}

const setupErrorHandlers = () => {
  process.on("SIGINT", () => {
    clearScreen();
    console.log(
      centerText(
        `${colors.yellow}Shutting down development environment...${colors.reset}`
      )
    );
    cleanupDocker();
    process.exit(0);
  });

  process.on("uncaughtException", (error) => {
    clearScreen();
    console.error(
      centerText(`${colors.red}Uncaught exception:${colors.reset}`)
    );
    console.error(centerText(error.message));
    cleanupDocker();
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    clearScreen();
    console.error(
      centerText(`${colors.red}Unhandled Rejection at:${colors.reset}`)
    );
    console.error(centerText(`Promise: ${promise}, Reason: ${reason}`));
    cleanupDocker();
    process.exit(1);
  });
};

async function main() {
  setupErrorHandlers();

  try {
    await setupDevelopmentEnvironment();
  } catch (error) {
    clearScreen();
    console.error(centerText(`${colors.red}Fatal error:${colors.reset}`));
    console.error(centerText(error.message));
    await cleanupDocker();
    process.exit(1);
  }
}

main().catch((error) => {
  clearScreen();
  console.error(centerText(`${colors.red}Unhandled error:${colors.reset}`));
  console.error(centerText(error.message));
  process.exit(1);
});
