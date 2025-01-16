#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const colors = require("./lib/colors");
const { checkRequiredServices, startDockerServices } = require("./lib/docker");
const { waitForServices, waitForInitServices } = require("./lib/services");
const { PROJECT_ROOT, execAsync, clearScreen } = require("./lib/utils");
const { createEnvFile } = require("./lib/env");
const { promisify } = require("node:util");
const sleep = promisify(setTimeout);

const INIT_FLAG_FILE = path.join(PROJECT_ROOT, ".init-complete");

async function showWelcomeBanner() {
  clearScreen();
  console.log(
    `${colors.cyan}🚀 Zephyr Development Environment Setup${colors.reset}`
  );
  console.log(
    `${colors.gray}═══════════════════════════════════════${colors.reset}\n`
  );
  await sleep(1000);
}

async function setupEnvironmentFiles() {
  if (
    !fs.existsSync(path.join(PROJECT_ROOT, "apps/web/.env")) ||
    !fs.existsSync(path.join(PROJECT_ROOT, "packages/db/.env"))
  ) {
    console.log(`${colors.yellow}📝 Creating Environment Files${colors.reset}`);
    console.log(`${colors.gray}────────────────────────────${colors.reset}`);
    createEnvFile();
    await sleep(1000);
    console.log(
      `${colors.green}✅ Environment files created successfully${colors.reset}\n`
    );
  }
}

async function showSuccessMessage() {
  clearScreen();
  console.log(
    `${colors.green}🎉 Development Environment Ready!${colors.reset}`
  );
  console.log(
    `${colors.gray}═══════════════════════════════════${colors.reset}\n`
  );

  console.log(`${colors.yellow}📝 Next Steps:${colors.reset}`);
  console.log(`${colors.gray}────────────────────────────${colors.reset}`);
  console.log("1. Open a new terminal");
  console.log(`2. Run: ${colors.cyan}turbo dev${colors.reset}\n`);

  console.log(`${colors.yellow}🔍 Monitoring:${colors.reset}`);
  console.log(`${colors.gray}────────────────────────────${colors.reset}`);
  console.log(
    `• View logs:    ${colors.cyan}docker-compose -f docker-compose.dev.yml logs -f${colors.reset}`
  );
  console.log(
    `• Stop services: ${colors.cyan}docker-compose -f docker-compose.dev.yml down${colors.reset}\n`
  );

  console.log(`${colors.yellow}🌐 Service URLs:${colors.reset}`);
  console.log(`${colors.gray}────────────────────────────${colors.reset}`);
  console.log(
    `• MinIO Console: ${colors.cyan}http://localhost:9001${colors.reset}`
  );
  console.log(`  Username: ${colors.green}minioadmin${colors.reset}`);
  console.log(`  Password: ${colors.green}minioadmin${colors.reset}\n`);

  console.log(
    `${colors.gray}═══════════════════════════════════${colors.reset}`
  );
}

async function main() {
  try {
    await showWelcomeBanner();

    const servicesOk = await checkRequiredServices();
    if (!servicesOk) {
      throw new Error("Required services are not available");
    }

    const isFirstRun = !fs.existsSync(INIT_FLAG_FILE);
    await setupEnvironmentFiles();

    const dockerStarted = await startDockerServices(isFirstRun);
    if (!dockerStarted) {
      throw new Error("Failed to start Docker services");
    }

    const servicesReady = await waitForServices();
    if (!servicesReady) {
      throw new Error("Core services failed to initialize");
    }

    if (isFirstRun) {
      const initServicesReady = await waitForInitServices();
      if (!initServicesReady) {
        throw new Error("Initialization services failed");
      }
      fs.writeFileSync(INIT_FLAG_FILE, new Date().toISOString());
    }

    await showSuccessMessage();
  } catch (error) {
    console.error(
      `\n${colors.red}Fatal error:${colors.reset} ${error.message}`
    );
    console.log(
      `\n${colors.yellow}Cleaning up and shutting down services...${colors.reset}`
    );
    await execAsync("docker-compose -f docker-compose.dev.yml down", {
      ignoreError: true
    });
    process.exit(1);
  }
}

// Graceful shutdown handler
async function shutdown(signal) {
  console.log(
    `\n${colors.yellow}Received ${signal}, shutting down...${colors.reset}`
  );
  await execAsync("docker-compose -f docker-compose.dev.yml down", {
    ignoreError: true
  });
  process.exit(0);
}

// Event handlers
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  console.error(`${colors.red}Uncaught exception:${colors.reset}`, error);
  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(
    `${colors.red}Unhandled Rejection at:${colors.reset}`,
    promise,
    "reason:",
    reason
  );
  shutdown("UNHANDLED_REJECTION");
});

main().catch((error) => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});
