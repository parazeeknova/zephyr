<div align="center">

  <h1>Zephyr</h1>
</div>

#### _<div align="left"><sub>// Project Overview</sub></div>_

<p align="left">
<strong>Zephyr</strong> is a Social aggregator, part social media platform, part news aggregator. It is a platform that allows users to share and discover content from around the web. Completly open-source and community-driven, Zephyr is a platform that is built by the community, for the community.
</p>

#### _<div align="left"><sub>// Development Setup (For Contributers)</sub></div>_

###### _<div align="right"><sub>// Prerequisites</sub></div>_

- [Node.js](https://nodejs.org/en/download/) (v20 or higher)
- [pnpm](https://pnpm.io/installation)
- [Turborepo](https://turbo.build/repo/docs/)

###### _<div align="right"><sub>// Installation</sub></div>_

<p align="left">
We use **pnpm** and **turbo** for managing the dependencies and the monorepo structutre. To install the dependencies and start the development server, run the following commands:
</p>

> [!IMPORTANT]
> Make sure you have the prerequisites installed before running the following commands and have `.env` file in the root directory.

```bash
# Clone the repository
git clone https://github.com/zephyr.git && cd zephyr
# Install the dependencies
pnpm install
# Start the development server on http://localhost:3000 (default web) and http://localhost:3001 (default wiki)
turbo dev
```

---
