<div align="center">

  <a href="https://github.com/parazeeknova/zephyr">
    <img src="./assets/Zephyr-Banner.png" alt="Banner" width="98%"/>
  </a>
</div>

---

<br>

<div align="center">
  <a href="https://github.com//parazeeknova/zephyr#-development-setup-for-contributers"><kbd> <br> Development <br> </kbd></a>&ensp;&ensp;
  <a href="https://github.com/parazeeknova/zephyr/blob/main/.github/CONTRIBUTING.md"><kbd> <br> Contribution <br> </kbd></a>&ensp;&ensp;
  <a href="https://github.com/parazeeknova/zephyr/wiki"><kbd> <br> Wiki <br> </kbd></a>&ensp;&ensp;
  <a href="https://github.com/parazeeknova/zephyr/wiki/Blueprint---Roadmap-%E2%80%90-Stack-%E2%80%90-STC"><kbd> <br> Roadmap <br> </kbd></a>&ensp;&ensp;
</div>

#### _<div align="left"><sub>// Project Overview</sub></div>_

<p align="left">
<strong>Zephyr</strong> is a Social aggregator, part social media platform, part news aggregator. It is a platform that allows users to share and discover content from around the web. Completly open-source and community-driven, Zephyr is a platform that is built by the community, for the community.
</p>

#### _<div align="left"><sub>// Local Development Setup</sub></div>_

###### _<div align="right"><sub>// Prerequisites</sub></div>_

- [Node.js](https://nodejs.org/) (v20 or higher)
- [pnpm](https://pnpm.io/installation) (Package manager)
- [Docker](https://www.docker.com/) (For development environment)
- [Git](https://git-scm.com/) (Version control)

###### _<div align="right"><sub>// Installation</sub></div>_

<p align="left">
We use <strong>pnpm</strong> and <strong>turbo</strong> for managing the dependencies and the monorepo structutre. To install the dependencies and start the development server, run the following commands:
</p>

> [!IMPORTANT]
> Use the format in `.env.example` file to create a `.env` file in the root directory.
> `dev-server` is a script that runs the development server for postgres, redis, minio and creates a temp `.env` to start with.

```bash
# 1. Clone the repository
git clone https://github.com/zephyr.git && cd zephyr

# 2. Install the dependencies
pnpm install

# 3. First time setup or after clean
pnpm run dev:server

# Subsequent starts
pnpm run docker:start

# Clean everything and start fresh
pnpm run docker:clean:dev && pnpm run dev:server

# 4. Set `.env` variables form `.env.example` file (optional if you want auth and other services)
cp .env.example .env # Unix/Linux/Mac
copy .env.example .env # Windows
# Read the `.env.example` file for more information

# 5.Start development server
pnpm run dev:start

# OR Manually
pnpm turbo dev
```

###### _<div align="right"><sub>// Ports:</sub></div>_

- Next.js: http://localhost:3000
- PostgreSQL: localhost:5433
- Redis: localhost:6379
- MinIO Console: http://localhost:9001


#### _<div align="left"><sub>// Troubleshooting Common Issues</sub></div>_

###### _<div align="right"><sub>// Prisma</sub></div>_

- If you encounter any issues with Prisma, try running the following commands:
```bash
cd packages/db
pnpm prisma generate
pnpm prisma db push
```

###### _<div align="right"><sub>// Minio</sub></div>_

- If you encounter any issues with Minio, create bucket manually:

```bash
Access MinIO Console at http://localhost:9001
Login with default credentials:
Username: minioadmin
Password: minioadmin
```
- Create buckets manually:
```bash
- uploads
- temp
- backups
```

#### _<div align="left"><sub>// Analytics</sub></div>_
![Alt](https://repobeats.axiom.co/api/embed/21d8d944036757fcd0624e71d0b2598ca8b8041f.svg "Repobeats analytics image")

#### _<div align="left"><sub>// License</sub></div>_

<p align="left">
<strong>Zephyr</strong> is licensed under the <a href="https://github.com/parazeeknova/zephyr/blob/main/LICENSE">AGPL License</a>.
</p>

<div align="right">
  <a href="#-project-overview"><kbd> <br> 🡅 <br> </kbd></a>
</div>

---
