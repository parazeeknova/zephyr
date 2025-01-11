#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const colors = require("./lib/colors");
const { checkRequiredServices, startDockerServices } = require("./lib/docker");
const { waitForServices, waitForInitServices } = require("./lib/services");
const { printBanner } = require("./lib/ui");
const { PROJECT_ROOT, execAsync } = require("./lib/utils");
const { createEnvFile } = require("./lib/env");

const INIT_FLAG_FILE = path.join(PROJECT_ROOT, ".init-complete");

async function main() {
  try {
    printBanner();

    const servicesOk = await checkRequiredServices();
    if (!servicesOk) {
      throw new Error("Required services are not available");
    }

    const isFirstRun = !fs.existsSync(INIT_FLAG_FILE);
    if (
      !fs.existsSync(path.join(PROJECT_ROOT, "apps/web/.env")) ||
      !fs.existsSync(path.join(PROJECT_ROOT, "packages/db/.env"))
    ) {
      console.log("📝 Creating .env files...");
      createEnvFile();
    }

    console.log(
      `\n${colors.yellow}🚀 Initializing Development Environment${colors.reset}`
    );
    console.log(
      `${colors.gray}----------------------------------------${colors.reset}`
    );

    const dockerStarted = await startDockerServices(isFirstRun);
    if (!dockerStarted) {
      throw new Error("Failed to start Docker services");
    }

    const servicesReady = await waitForServices();
    if (!servicesReady) {
      throw new Error("Core services failed to initialize");
    }

    if (isFirstRun) {
      console.log(
        `\n${colors.yellow}🔄 First Run Detected - Running Initialization${colors.reset}`
      );
      const initServicesReady = await waitForInitServices();
      if (!initServicesReady) {
        throw new Error("Initialization services failed");
      }
      fs.writeFileSync(INIT_FLAG_FILE, new Date().toISOString());
    }

    console.log(
      `\n${colors.green}🎉 Development Environment Ready!${colors.reset}`
    );
    console.log(
      `${colors.gray}==========================================\n${colors.reset}`
    );

    console.log(`${colors.yellow}📝 Next Steps:${colors.reset}`);
    console.log(
      `${colors.gray}------------------------------------------${colors.reset}`
    );
    console.log("1. Open a new terminal");
    console.log(`2. Run: ${colors.cyan}pnpm turbo dev${colors.reset}`);

    console.log(`\n${colors.yellow}🔍 Monitoring:${colors.reset}`);
    console.log(
      `${colors.gray}------------------------------------------${colors.reset}`
    );
    console.log(
      `• View logs: ${colors.cyan}docker-compose -f docker-compose.dev.yml logs -f${colors.reset}`
    );
    console.log(
      `• Stop services: ${colors.cyan}docker-compose -f docker-compose.dev.yml down${colors.reset}`
    );

    console.log(`\n${colors.yellow}🌐 Service URLs:${colors.reset}`);
    console.log(
      `${colors.gray}------------------------------------------${colors.reset}`
    );
    console.log(
      `• MinIO Console: ${colors.cyan}http://localhost:9001${colors.reset}`
    );
    console.log(`  Username: ${colors.green}minioadmin${colors.reset}`);
    console.log(`  Password: ${colors.green}minioadmin${colors.reset}`);

    console.log(
      `\n${colors.gray}==========================================${colors.reset}`
    );
  } catch (error) {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
    console.log(
      `\n${colors.yellow}Cleaning up and shutting down services...${colors.reset}`
    );
    await execAsync("docker-compose -f docker-compose.dev.yml down", {
      ignoreError: true
    });
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  console.log(
    `\n${colors.yellow}Shutting down development environment...${colors.reset}`
  );
  execAsync("docker-compose -f docker-compose.dev.yml down", {
    ignoreError: true
  });
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
