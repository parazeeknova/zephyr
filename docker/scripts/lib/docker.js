const { execSync } = require("node:child_process");
const colors = require("./colors");
const { execAsync } = require("./utils");

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
    console.error(
      "Please ensure Docker and Docker Compose are installed and running."
    );
    return false;
  }
}

async function startDockerServices(isFirstRun) {
  try {
    console.log("🛑 Stopping existing containers...");
    await execAsync("docker-compose -f docker-compose.dev.yml down -v", {
      ignoreError: true
    });

    // Clean up any existing volumes
    await execAsync(
      "docker volume rm zephyr_postgres_data_dev zephyr_redis_data_dev zephyr_minio_data_dev",
      {
        ignoreError: true
      }
    );

    // Force remove any existing networks
    await execAsync("docker network prune -f", { ignoreError: true });

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
  startDockerServices
};
