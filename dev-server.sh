#!/bin/bash

print_banner() {
    echo -e "\033[36m"
    cat << "EOB"
███████╗███████╗██████╗ ██╗  ██╗██╗   ██╗██████╗ 
╚══███╔╝██╔════╝██╔══██╗██║  ██║╚██╗ ██╔╝██╔══██╗
  ███╔╝ █████╗  ██████╔╝███████║ ╚████╔╝ ██████╔╝
 ███╔╝  ██╔══╝  ██╔═══╝ ██╔══██║  ╚██╔╝  ██╔══██╗
███████╗███████╗██║     ██║  ██║   ██║   ██║  ██║
╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
[DEV] Local Development Environment
EOB
    echo -e "\033[33m📚 Development Server Setup Script\033[0m"
    echo -e "\033[90m----------------------------------------\033[0m"
}

create_env_file() {
    ENV_CONTENT='POSTGRES_USER=postgres
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
# JWT
JWT_SECRET=zephyrjwtsupersecret
JWT_EXPIRES_IN=7d
# Next.js
NEXT_PUBLIC_PORT=3000
NEXT_PUBLIC_URL=http://localhost:3000
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1'

    echo "$ENV_CONTENT" > .env
    echo -e "\033[32m✅ Created root .env file\033[0m"

    mkdir -p apps/web
    echo "$ENV_CONTENT" > apps/web/.env
    echo -e "\033[32m✅ Created apps/web/.env file\033[0m"

    mkdir -p packages/db
    echo "$ENV_CONTENT" > packages/db/.env
    echo -e "\033[32m✅ Created packages/db/.env file\033[0m"
}

if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    create_env_file
fi

echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

echo "🚀 Starting Docker containers..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

if docker logs zephyr-postgres-dev 2>&1 | grep -q "Prisma setup failed"; then
    echo "⚠️ Prisma setup needs manual initialization"
    echo "Please run the following commands in a new terminal:"
    echo "1. cd packages/db"
    echo "2. pnpm prisma generate"
    echo "3. pnpm prisma db push"
fi

print_minio_instructions() {
    cat << "EOT"

📦 Manual MinIO Setup Instructions:
1. Access MinIO Console: http://localhost:9001
   - Username: minioadmin
   - Password: minioadmin
2. Create Buckets:
   a. Click 'Create Bucket'
   b. Create the following buckets:
      - uploads (for general uploads)
      - temp (for temporary files)
      - backups (for system backups)
   c. For each bucket:
      - Click on the bucket
      - Go to 'Manage'
      - Set 'Access Policy' to 'public'
      - Enable 'Versioning'
3. For 'backups' bucket:
   - Set retention policy to 7 days

💡 Alternatively, wait for automatic setup via setup-minio.sh

EOT
}

echo "🗄️ Setting up MinIO..."
if ! ./docker/minio/setup-minio.sh; then
    echo -e "\033[33m⚠️ MinIO automatic setup failed. Please follow manual setup instructions:\033[0m"
    print_minio_instructions
fi

cat << "EOT"

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

EOT

echo "📋 Starting log stream (Ctrl+C to exit)..."
echo "----------------------------------------"
docker-compose -f docker-compose.dev.yml logs -f
