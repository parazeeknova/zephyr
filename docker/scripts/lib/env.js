const fs = require("node:fs");
const path = require("node:path");
const colors = require("./colors");
const { PROJECT_ROOT } = require("./utils");

function createEnvFile() {
  const webEnvContent = `
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-development-secret-key

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/zephyr
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5433/zephyr
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5433/zephyr

# Redis
REDIS_URL=redis://:zephyrredis@localhost:6379/0

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=uploads
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
