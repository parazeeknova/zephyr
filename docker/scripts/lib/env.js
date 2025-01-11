const fs = require("node:fs");
const path = require("node:path");
const colors = require("./colors");
const { PROJECT_ROOT } = require("./utils");

function createEnvFile() {
  const webEnvContent = `
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
REDIS_URL=redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/0

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET_NAME=uploads
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_HOST=localhost
MINIO_ENDPOINT=http://${MINIO_HOST}:${MINIO_PORT}
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:${MINIO_PORT}
MINIO_ENABLE_OBJECT_LOCKING=on

# Application
JWT_SECRET=zephyrjwtsupersecret
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_PORT=3000
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

#Mics
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
TURBO_TELEMERY_DISABLED=1

`.trim();

  const dbEnvContent = `
# Database URLs for Prisma
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/zephyr
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5433/zephyr
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5433/zephyr

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=zephyr
POSTGRES_PORT=5433
POSTGRES_HOST=localhost
`.trim();

  try {
    // Create apps/web/.env
    const appsWebDir = path.join(PROJECT_ROOT, "apps/web");
    fs.mkdirSync(appsWebDir, { recursive: true });
    fs.writeFileSync(path.join(appsWebDir, ".env"), webEnvContent);
    console.log(`${colors.green}✅ Created apps/web/.env${colors.reset}`);

    // Create packages/db/.env
    const packagesDbDir = path.join(PROJECT_ROOT, "packages/db");
    fs.mkdirSync(packagesDbDir, { recursive: true });
    fs.writeFileSync(path.join(packagesDbDir, ".env"), dbEnvContent);
    console.log(`${colors.green}✅ Created packages/db/.env${colors.reset}`);

    return true;
  } catch (error) {
    console.error(
      `${colors.red}Failed to create environment files:${colors.reset}`,
      error.message
    );
    return false;
  }
}

function validateEnvFiles() {
  const requiredFiles = [
    {
      path: "apps/web/.env",
      vars: [
        "NEXT_PUBLIC_APP_URL",
        "NEXTAUTH_URL",
        "NEXTAUTH_SECRET",
        "DATABASE_URL",
        "REDIS_URL",
        "MINIO_ENDPOINT"
      ]
    },
    {
      path: "packages/db/.env",
      vars: [
        "DATABASE_URL",
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
        "POSTGRES_DB"
      ]
    }
  ];

  let isValid = true;

  for (const file of requiredFiles) {
    const filePath = path.join(PROJECT_ROOT, file.path);
    if (!fs.existsSync(filePath)) {
      console.error(`${colors.red}❌ Missing ${file.path}${colors.reset}`);
      isValid = false;
      continue;
    }

    const envContent = fs.readFileSync(filePath, "utf8");
    const envVars = Object.fromEntries(
      envContent
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"))
        .map((line) => line.split("=").map((part) => part.trim()))
    );

    for (const requiredVar of file.vars) {
      if (!envVars[requiredVar]) {
        console.error(
          `${colors.red}❌ Missing ${requiredVar} in ${file.path}${colors.reset}`
        );
        isValid = false;
      }
    }
  }

  return isValid;
}

module.exports = {
  createEnvFile,
  validateEnvFiles
};
