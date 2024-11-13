# CONTRIBUTING TO ZEPHYR

Thank you for your interest in contributing to Zephyr! This guide will help you start contributing to our community-driven platform.

## TABLE OF CONTENTS
1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Making Contributions](#making-contributions)
4. [Code Standards](#code-standards)
5. [Troubleshooting](#troubleshooting)
6. [Community Guidelines](#community-guidelines)

## 1. DEVELOPMENT SETUP

### PREREQUISITES:
* Node.js v20+
* pnpm
* Docker + Docker Compose
* Git

### STEP-BY-STEP SETUP:

#### a) Clone Repository:
```sh
$ git clone https://github.com/YOUR_USERNAME/zephyr.git
$ cd zephyr
```

#### b) Install Dependencies:
```sh
$ pnpm install
```

#### c) Environment Setup:
1. Copy environment templates:
  - `apps/web/.env.example` → `apps/web/.env`
  - Create `packages/db/.env`

2. Configure Environment Variables:
  ```ini
  [DATABASE]
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=postgres
  POSTGRES_DB=zephyr
  POSTGRES_PORT=5433
  POSTGRES_HOST=localhost
  DATABASE_URL=postgresql://postgres:postgres@localhost:5433/zephyr?schema=public

  [REDIS]
  REDIS_PASSWORD=zephyrredis
  REDIS_PORT=6379
  REDIS_HOST=localhost

  [MINIO]
  MINIO_ROOT_USER=minioadmin
  MINIO_ROOT_PASSWORD=minioadmin
  MINIO_PORT=9000
  MINIO_CONSOLE_PORT=9001
  ```

#### d) Start Development:
- Windows: `./dev-start.ps1`
- Unix: `./dev-start.sh`

Or manually:
```sh
$ docker-compose -f docker-compose.dev.yml up -d
$ pnpm turbo dev
```

## 2. PROJECT STRUCTURE

```
/zephyr
  /apps
   /web          - Next.js application
  /packages
   /auth         - Authentication
   /config       - Shared configs
   /db           - Database (Prisma)
   /ui           - UI components
  /docker         - Container configs
```

## 3. MAKING CONTRIBUTIONS

### WORKFLOW:

1. Fork & Branch
  ```sh
  $ git checkout -b feature/your-feature
  ```

2. Development
  - Write code
  - Add tests
  - Update docs
  - Follow style guide

3. Commit
  Format: `<type>(<scope>): <description>`
  Example: `feat(auth): add password reset`

4. Pull Request
  - Fill template
  - Link issues
  - Pass checks

### DEVELOPMENT COMMANDS:

Start servers:
```sh
$ pnpm turbo dev
```

Check code:
```sh
$ pnpm biome:check
```

Fix style:
```sh
$ pnpm biome:fix
```

## 4. CODE STANDARDS

### STYLE RULES:
- Use TypeScript
- Follow Biome config
- Keep files focused
- Comment complex logic
- Use meaningful names

### COMMIT TYPES:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code change
- `test`: Adding tests
- `chore`: Maintenance

## 5. TROUBLESHOOTING

### DATABASE ISSUES:

Check logs:
```sh
$ docker logs zephyr-postgres-dev
```

Manual Prisma setup:
```sh
$ cd packages/db
$ pnpm prisma generate
$ pnpm prisma db push
```

### DOCKER ISSUES:

Reset containers:
```sh
$ docker-compose down -v
$ docker-compose build --no-cache
$ docker-compose up
```

### COMMON FIXES:

1. Database Connection:
  - Verify PostgreSQL is running
  - Check port conflicts
  - Validate connection string

2. Environment:
  - Confirm all variables set
  - Check file locations
  - Validate syntax

3. Build Errors:
  - Clear `node_modules`
  - Rebuild dependencies
  - Check Docker logs

## 6. COMMUNITY GUIDELINES

### COMMUNICATION:
- Be respectful
- Stay on topic
- Help others
- Follow code of conduct

### ISSUE REPORTING:
- Check existing issues
- Provide reproduction
- Be specific
- Follow templates

### PULL REQUESTS:
- Link related issues
- Describe changes
- Add tests
- Update docs

======================

## QUICK REFERENCE:

### Ports:
- Web: 3000
- PostgreSQL: 5433
- Redis: 6379
- MinIO: 9000/9001

### Commands:
- Setup: `pnpm install`
- Dev: `pnpm turbo dev`
- Style: `pnpm biome:check`
- Fix: `pnpm biome:fix`

======================

Thank you for contributing to Zephyr!
For detailed information, visit our GitHub repository.
