const { execSync } = require("node:child_process");
const colors = require("./colors");
const { execAsync, clearScreen } = require("./utils");
const { createStatusTable } = require("./ui");
const { promisify } = require("node:util");
const sleep = promisify(setTimeout);

const DOCKER_VOLUMES = {
  zephyr_postgres_data_dev: "PostgreSQL",
  zephyr_redis_data_dev: "Redis",
  zephyr_minio_data_dev: "MinIO"
};

async function isDockerRunning() {
  try {
    await execAsync("docker info", { silent: true });
    return true;
    // biome-ignore lint/correctness/noUnusedVariables: ignore
  } catch (error) {
    return false;
  }
}

async function waitForDocker(maxAttempts = 30) {
  clearScreen();
  console.log(`${colors.cyan}🐳 Docker Status Check${colors.reset}`);
  console.log(
    `${colors.gray}═══════════════════════════════════${colors.reset}\n`
  );

  const dockerStatus = {
    "Docker Engine": {
      url: "System Service",
      status: "Waiting"
    }
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (await isDockerRunning()) {
      dockerStatus["Docker Engine"].status = "Ready";
      await createStatusTable(dockerStatus);
      await sleep(1000);
      return true;
    }

    dockerStatus["Docker Engine"].status = "Waiting";
    await createStatusTable(dockerStatus);
    await sleep(2000);
  }

  dockerStatus["Docker Engine"].status = "Failed";
  await createStatusTable(dockerStatus);

  console.log(`\n${colors.red}❌ Docker is not running${colors.reset}`);
  console.log(
    `\n${colors.yellow}Please ensure Docker is running:${colors.reset}`
  );
  console.log(
    `• ${colors.cyan}Windows/Mac${colors.reset}: Start Docker Desktop`
  );
  console.log(
    `• ${colors.cyan}Linux${colors.reset}: Run ${colors.gray}sudo systemctl start docker${colors.reset}`
  );
  return false;
}

async function cleanupDockerResources() {
  clearScreen();
  console.log(`${colors.cyan}🧹 Cleaning Up Docker Resources${colors.reset}`);
  console.log(
    `${colors.gray}═══════════════════════════════════${colors.reset}\n`
  );

  const cleanupStatus = {};
  for (const [volume, service] of Object.entries(DOCKER_VOLUMES)) {
    cleanupStatus[service] = {
      url: volume,
      status: "Pending"
    };
  }

  try {
    console.log(
      `${colors.yellow}⏳ Stopping existing containers...${colors.reset}`
    );
    await execAsync("docker-compose -f docker-compose.dev.yml down", {
      silent: true,
      ignoreError: true
    });
    await sleep(1000);

    for (const [volume, service] of Object.entries(DOCKER_VOLUMES)) {
      cleanupStatus[service].status = "Cleaning";
      await createStatusTable(cleanupStatus);

      try {
        await execAsync(`docker volume rm ${volume}`, {
          silent: true,
          ignoreError: true
        });
        cleanupStatus[service].status = "Ready";
        // biome-ignore lint/correctness/noUnusedVariables: ignore
      } catch (error) {
        cleanupStatus[service].status = "Not Found";
      }
      await createStatusTable(cleanupStatus);
      await sleep(500);
    }

    await execAsync("docker network prune -f", {
      silent: true,
      ignoreError: true
    });

    console.log(
      `\n${colors.green}✅ Cleanup completed successfully!${colors.reset}`
    );
    await sleep(1000);
    return true;
  } catch (error) {
    console.error(
      `\n${colors.red}Error during cleanup:${colors.reset}`,
      error.message
    );
    return false;
  }
}

async function checkRequiredServices() {
  try {
    execSync("docker --version", { stdio: "pipe" });
    execSync("docker-compose --version", { stdio: "pipe" });
    return true;
  } catch (error) {
    console.error(
      `${colors.red}Required services check failed:${colors.reset}`,
      error.message
    );
    return false;
  }
}

async function startDockerServices(isFirstRun) {
  try {
    const dockerReady = await waitForDocker();
    if (!dockerReady) {
      return false;
    }

    const cleanupSuccess = await cleanupDockerResources();
    if (!cleanupSuccess) {
      return false;
    }

    console.log(
      `\n${colors.blue}🚀 Starting Docker services...${colors.reset}`
    );
    const command = isFirstRun
      ? "docker-compose -f docker-compose.dev.yml --profile init up -d --build --remove-orphans --force-recreate"
      : "docker-compose -f docker-compose.dev.yml up -d --build --remove-orphans --force-recreate";

    await execAsync(command);
    return true;
  } catch (error) {
    console.error(
      `${colors.red}Failed to manage Docker containers:${colors.reset}`,
      error.message
    );
    return false;
  }
}

module.exports = {
  checkRequiredServices,
  startDockerServices,
  waitForDocker,
  cleanupDockerResources
};
