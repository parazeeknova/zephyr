#!/usr/bin/env node

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "../../");
const INIT_FLAG_FILE = path.join(PROJECT_ROOT, ".init-complete");

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
  const baseEnvContent = `
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=zephyr
POSTGRES_PORT=5433
POSTGRES_HOST=localhost
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
MINIO_ENABLE_OBJECT_LOCKING=on

# Application
JWT_SECRET=zephyrjwtsupersecret
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
TURBO_TELEMERY_DISABLED=1

#Mics
CRON_SECRET=supersecretdevelopment
JWT_EXPIRES_IN=2d
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# OAUTH Providers (Optional in development)
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Mail Provider (Optional in development)
SUPPORT_EMAIL=
GMAIL_USER=
GMAIL_APP_PASSWORD=

# Chat (Optional in development)
NEXT_PUBLIC_STREAM_KEY=
STREAM_SECRET=
`.trim();

  const dbEnvContent = `
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=zephyr
POSTGRES_PORT=5433
POSTGRES_HOST=localhost
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/zephyr?schema=public
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5433/zephyr?schema=public
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5433/zephyr?schema=public
`.trim();

  try {
    const appsWebDir = path.join(PROJECT_ROOT, "apps/web");
    fs.mkdirSync(appsWebDir, { recursive: true });
    fs.writeFileSync(path.join(appsWebDir, ".env"), baseEnvContent);
    console.log(`${colors.green}✅ Created apps/web/.env file${colors.reset}`);

    const packagesDbDir = path.join(PROJECT_ROOT, "packages/db");
    fs.mkdirSync(packagesDbDir, { recursive: true });
    fs.writeFileSync(path.join(packagesDbDir, ".env"), dbEnvContent);
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

async function execAsync(command, options = {}) {
  try {
    execSync(command, {
      stdio: options.silent ? "pipe" : "inherit",
      cwd: PROJECT_ROOT,
      ...options
    });
    return true;
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return false;
  }
}

async function waitForContainer(containerName, healthCheck, maxAttempts = 30) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync(healthCheck, { stdio: "pipe" });
      console.log(`${colors.green}✅ ${containerName} is ready${colors.reset}`);
      return true;
      // biome-ignore lint/correctness/noUnusedVariables: This is a catch-all error handler
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error(
          `${colors.red}${containerName} failed to start${colors.reset}`
        );
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(
        `Waiting for ${containerName}... (${attempt}/${maxAttempts})`
      );
    }
  }
}

async function startDockerServices(isFirstRun) {
  try {
    console.log("🛑 Stopping existing containers...");
    await execAsync("docker-compose -f docker-compose.dev.yml down", {
      ignoreError: true
    });

    console.log(
      `\n${colors.blue}🚀 Starting Docker services...${colors.reset}`
    );
    const command = isFirstRun
      ? "docker-compose -f docker-compose.dev.yml --profile init up -d --build --remove-orphans"
      : "docker-compose -f docker-compose.dev.yml up -d --build --remove-orphans";

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

async function waitForServices(maxAttempts = 30) {
  console.log(`\n${colors.blue}⏳ Checking core services...${colors.reset}`);

  const services = {
    PostgreSQL: {
      name: "PostgreSQL",
      healthCheck: "docker exec zephyr-postgres-dev pg_isready",
      url: "localhost:5433"
    },
    Redis: {
      name: "Redis",
      healthCheck: "docker exec zephyr-redis-dev redis-cli -a zephyrredis ping",
      url: "localhost:6379"
    },
    MinIO: {
      name: "MinIO",
      healthCheck:
        "curl -s -o /dev/null -w '%{http_code}' http://localhost:9000/minio/health/live",
      url: "http://localhost:9000"
    }
  };

  const serviceStatus = {};

  for (const [key, service] of Object.entries(services)) {
    serviceStatus[key] = {
      url: service.url,
      status: "Waiting"
    };
  }

  console.log(`\n${colors.yellow}📊 Initial Service Status${colors.reset}`);
  await createStatusTable(serviceStatus);

  for (const [key, service] of Object.entries(services)) {
    const success = await waitForContainer(
      service.name,
      service.healthCheck,
      maxAttempts
    );
    serviceStatus[key].status = success ? "Ready" : "Failed";

    if (!success) {
      console.log(`\n${colors.yellow}📊 Final Service Status${colors.reset}`);
      await createStatusTable(serviceStatus);
      return false;
    }
  }

  console.log(`\n${colors.yellow}📊 Final Service Status${colors.reset}`);
  await createStatusTable(serviceStatus);
  return true;
}

async function createStatusTable(services) {
  const maxNameLength = 15;
  const maxUrlLength = 30;
  const maxStatusLength = 10;

  // Header
  console.log(
    `\n${colors.gray}┌${"─".repeat(maxNameLength)}┬${"─".repeat(
      maxUrlLength
    )}┬${"─".repeat(maxStatusLength)}┐${colors.reset}`
  );
  console.log(
    `${colors.gray}│${colors.blue} SERVICE${" ".repeat(maxNameLength - 8)}${
      colors.gray
    }│${colors.blue} ENDPOINT${" ".repeat(maxUrlLength - 9)}${colors.gray}│${
      colors.blue
    } STATUS${" ".repeat(maxStatusLength - 7)}${colors.gray}│${colors.reset}`
  );
  console.log(
    `${colors.gray}├${"─".repeat(maxNameLength)}┼${"─".repeat(
      maxUrlLength
    )}┼${"─".repeat(maxStatusLength)}┤${colors.reset}`
  );

  // Service rows
  for (const [name, { url, status }] of Object.entries(services)) {
    const namePadded = name.padEnd(maxNameLength);
    const urlPadded = url.padEnd(maxUrlLength);
    const statusColor = status === "Ready" ? colors.green : colors.red;
    const statusSymbol = status === "Ready" ? "✓" : "✗";

    console.log(
      `${colors.gray}│${colors.reset} ${namePadded}${colors.gray}│${
        colors.reset
      } ${urlPadded}${colors.gray}│${statusColor} ${statusSymbol}${" ".repeat(
        maxStatusLength - 2
      )}${colors.gray}│${colors.reset}`
    );
  }

  // Footer
  console.log(
    `${colors.gray}└${"─".repeat(maxNameLength)}┴${"─".repeat(
      maxUrlLength
    )}┴${"─".repeat(maxStatusLength)}┘${colors.reset}`
  );
}

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
