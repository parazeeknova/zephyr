$banner = @"
███████╗███████╗██████╗ ██╗  ██╗██╗   ██╗██████╗ 
╚══███╔╝██╔════╝██╔══██╗██║  ██║╚██╗ ██╔╝██╔══██╗
  ███╔╝ █████╗  ██████╔╝███████║ ╚████╔╝ ██████╔╝
 ███╔╝  ██╔══╝  ██╔═══╝ ██╔══██║  ╚██╔╝  ██╔══██╗
███████╗███████╗██║     ██║  ██║   ██║   ██║  ██║
╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
[DEV] Local Development Environment
"@

Write-Host $banner -ForegroundColor Cyan
Write-Host "📚 Development Server Setup Script" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor DarkGray

function Create-EnvFile {
    $envContent = @"
POSTGRES_USER=postgres
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
REDIS_URL=redis://:`${REDIS_PASSWORD}@`${REDIS_HOST}:`${REDIS_PORT}/0
# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET_NAME=uploads
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_HOST=localhost
MINIO_ENDPOINT=http://`${MINIO_HOST}:`${MINIO_PORT}
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:`${MINIO_PORT}
# JWT
JWT_SECRET=zephyrjwtsupersecret
JWT_EXPIRES_IN=7d
# Next.js
NEXT_PUBLIC_PORT=3000
NEXT_PUBLIC_URL=http://localhost:3000
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
"@

    Set-Content -Path ".env" -Value $envContent
    Write-Host "✅ Created .env file" -ForegroundColor Green
}

if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Create-EnvFile
}

Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down

Write-Host "🚀 Starting Docker containers..." -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml up -d

Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$postgresLogs = docker logs zephyr-postgres-dev 2>&1
if ($postgresLogs -match "Prisma setup failed") {
    Write-Host "⚠️ Prisma setup needs manual initialization" -ForegroundColor Yellow
    Write-Host @"
Please run the following commands in a new terminal:
1. cd packages/db
2. pnpm prisma generate
3. pnpm prisma db push
"@ -ForegroundColor Cyan
}

$minioInstructions = @"

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

"@

Write-Host "🗄️ Setting up MinIO..." -ForegroundColor Cyan
$minioSetup = ./docker/minio/setup-minio.sh
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ MinIO automatic setup failed. Please follow manual setup instructions:" -ForegroundColor Yellow
    Write-Host $minioInstructions -ForegroundColor Cyan
}

Write-Host @"

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

"@ -ForegroundColor Green

Write-Host "📋 Starting log stream (Ctrl+C to exit)..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor DarkGray
docker-compose -f docker-compose.dev.yml logs -f
