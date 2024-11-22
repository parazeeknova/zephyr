#!/usr/bin/env node

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");

const _rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
███████╗███████╗██████╗ ██╗  ██╗██╗   ██╗██████╗ 
╚══███╔╝██╔════╝██╔══██╗██║  ██║╚██╗ ██╔╝██╔══██╗
  ███╔╝ █████╗  ██████╔╝███████║ ╚████╔╝ ██████╔╝
 ███╔╝  ██╔══╝  ██╔═══╝ ██╔══██║  ╚██╔╝  ██╔══██╗
███████╗███████╗██║     ██║  ██║   ██║   ██║  ██║
╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
[DEV] Local Development Environment
`);
  console.log(
    `${colors.yellow}📚 Development Server Setup Script${colors.reset}`
  );
  console.log(
    `${colors.gray}----------------------------------------${colors.reset}`
  );
}

function createEnvFile() {
  const envContent = `POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=zephyr
POSTGRES_PORT=5433
POSTGRES_HOST=localhost
# Database URLs
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/zephyr?schema=public
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5433/zephyr?schema=public
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5433/zephyr?schema=public
# Redis
REDIS_PASSWORD=zephyrredis
REDIS_PORT=6379
REDIS_HOST=localhost
REDIS_URL=redis://:$\{REDIS_PASSWORD}@$\{REDIS_HOST}:$\{REDIS_PORT}/0
# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET_NAME=uploads
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_HOST=localhost
MINIO_ENDPOINT=http://$\{MINIO_HOST}:$\{MINIO_PORT}
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:$\{MINIO_PORT}
# JWT
JWT_SECRET=zephyrjwtsupersecret
JWT_EXPIRES_IN=7d
# Next.js
NEXT_PUBLIC_PORT=3000
NEXT_PUBLIC_URL=http://localhost:3000
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1`;

  try {
    // Create root .env
    fs.writeFileSync(path.join(PROJECT_ROOT, ".env"), envContent);
    console.log(`${colors.green}✅ Created root .env file${colors.reset}`);

    // Create apps/web/.env
    const appsWebDir = path.join(PROJECT_ROOT, "apps/web");
    fs.mkdirSync(appsWebDir, { recursive: true });
    fs.writeFileSync(path.join(appsWebDir, ".env"), envContent);
    console.log(`${colors.green}✅ Created apps/web/.env file${colors.reset}`);

    // Create packages/db/.env
    const packagesDbDir = path.join(PROJECT_ROOT, "packages/db");
    fs.mkdirSync(packagesDbDir, { recursive: true });
    fs.writeFileSync(path.join(packagesDbDir, ".env"), envContent);
    console.log(
      `${colors.green}✅ Created packages/db/.env file${colors.reset}`
    );
  } catch (error) {
    console.error(
      `${colors.red}Failed to create .env files:${colors.reset}`,
      error.message
    );
    throw error;
  }
}

async function waitForServices(maxAttempts = 30) {
  console.log("⏳ Waiting for services to be ready...");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync("docker exec zephyr-postgres-dev pg_isready", { stdio: "pipe" });
      console.log(`${colors.green}✅ PostgreSQL is ready${colors.reset}`);
      break;
    } catch (_error) {
      if (attempt === maxAttempts) {
        console.error(
          `${colors.red}PostgreSQL failed to respond${colors.reset}`
        );
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync("curl -sf http://localhost:9000/minio/health/live", {
        stdio: "pipe"
      });
      console.log(`${colors.green}✅ MinIO is ready${colors.reset}`);
      break;
    } catch (_error) {
      if (attempt === maxAttempts) {
        console.error(`${colors.red}MinIO failed to respond${colors.reset}`);
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync(
        `docker exec zephyr-redis-dev redis-cli -a "${process.env.REDIS_PASSWORD || "zephyrredis"}" ping`,
        { stdio: "pipe" }
      );
      console.log(`${colors.green}✅ Redis is ready${colors.reset}`);
      break;
    } catch (_error) {
      if (attempt === maxAttempts) {
        console.error(`${colors.red}Redis failed to respond${colors.reset}`);
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return true;
}

async function startDockerServices() {
  try {
    console.log("🛑 Stopping existing containers...");
    execSync("docker-compose -f docker-compose.dev.yml down", {
      cwd: PROJECT_ROOT,
      stdio: "inherit"
    });

    console.log("🚀 Starting Docker containers...");
    execSync("docker-compose -f docker-compose.dev.yml up -d", {
      cwd: PROJECT_ROOT,
      stdio: "inherit"
    });
    return true;
  } catch (error) {
    console.error(
      `${colors.red}Failed to manage Docker containers:${colors.reset}`,
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
    console.error(
      "Please ensure Docker and Docker Compose are installed and running."
    );
    return false;
  }
}

async function main() {
  try {
    printBanner();

    const servicesOk = await checkRequiredServices();
    if (!servicesOk) {
      throw new Error("Required services are not available");
    }

    if (!fs.existsSync(path.join(PROJECT_ROOT, ".env"))) {
      console.log("📝 Creating .env files...");
      createEnvFile();
    }

    const dockerStarted = await startDockerServices();
    if (!dockerStarted) {
      throw new Error("Failed to start Docker services");
    }

    const servicesReady = await waitForServices();
    if (!servicesReady) {
      throw new Error("Services failed to initialize");
    }

    console.log(`
🎉 Development Environment Ready!
==========================================

🔧 Services:
-----------------------------------------
📡 Next.js     : http://localhost:3000
📦 MinIO UI    : http://localhost:9001
🗄️ PostgreSQL  : localhost:5433
💾 Redis       : localhost:6379

📝 Next Steps:
-----------------------------------------
1. Open a new terminal
2. Run: pnpm turbo dev

🔍 Monitoring:
-----------------------------------------
• View logs: docker-compose -f docker-compose.dev.yml logs -f
• Stop services: docker-compose -f docker-compose.dev.yml down
`);

    console.log("📋 Starting log stream (Ctrl+C to exit)...");
    console.log("----------------------------------------");
    execSync("docker-compose -f docker-compose.dev.yml logs -f", {
      stdio: "inherit",
      cwd: PROJECT_ROOT
    });
  } catch (error) {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  console.log(
    `\n${colors.yellow}Shutting down development environment...${colors.reset}`
  );
  try {
    execSync("docker-compose -f docker-compose.dev.yml down", {
      cwd: PROJECT_ROOT,
      stdio: "inherit"
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
