#!/usr/bin/env node

const { execSync } = require("node:child_process");
const readline = require("node:readline");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "../../");
const DEV_COMPOSE_FILE = path.join(PROJECT_ROOT, "docker-compose.dev.yml");
const PROD_COMPOSE_FILE = path.join(PROJECT_ROOT, "docker-compose.prod.yml");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

function execCommand(command, ignoreError = false) {
  try {
    return execSync(command, {
      stdio: "pipe",
      cwd: PROJECT_ROOT,
      encoding: "utf8"
    }).trim();
  } catch (error) {
    if (!ignoreError) throw error;
    return "";
  }
}

function showBanner() {
  console.log(colors.cyan);
  console.log(`
███████╗███████╗██████╗ ██╗  ██╗██╗   ██╗██████╗ 
╚══███╔╝██╔════╝██╔══██╗██║  ██║╚██╗ ██╔╝██╔══██╗
  ███╔╝ █████╗  ██████╔╝███████║ ╚████╔╝ ██████╔╝
 ███╔╝  ██╔══╝  ██╔═══╝ ██╔══██║  ╚██╔╝  ██╔══██╗
███████╗███████╗██║     ██║  ██║   ██║   ██║  ██║
╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
[DOCKER] Cleanup Utility
  `);
  console.log(colors.reset);
}

function showMenu() {
  console.log(`${colors.yellow}🧹 Docker Cleanup Options:${colors.reset}`);
  console.log(
    `${colors.gray}----------------------------------------${colors.reset}`
  );
  console.log(`${colors.green}1. Clean Development Environment${colors.reset}`);
  console.log(`${colors.red}2. Clean Production Environment${colors.reset}`);
  console.log(`${colors.magenta}3. Clean All Docker Resources${colors.reset}`);
  console.log(`${colors.blue}4. Show Docker Status${colors.reset}`);
  console.log(`${colors.gray}5. Exit${colors.reset}`);
  console.log(
    `${colors.gray}----------------------------------------${colors.reset}`
  );
}

async function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function cleanDevEnvironment() {
  console.log(
    `${colors.yellow}🧹 Cleaning Development Environment...${colors.reset}`
  );

  const confirm = await question(
    "⚠️  This will remove all development containers, volumes, and networks. Continue? (y/N) "
  );
  if (confirm.toLowerCase() !== "y") {
    console.log(`${colors.red}❌ Operation cancelled${colors.reset}`);
    return;
  }

  try {
    console.log(
      `${colors.yellow}🛑 Stopping development containers...${colors.reset}`
    );
    execSync(
      `docker compose -f "${DEV_COMPOSE_FILE}" down -v --remove-orphans`,
      {
        stdio: "inherit",
        cwd: PROJECT_ROOT
      }
    );

    console.log(
      `${colors.yellow}🗑️  Removing development volumes...${colors.reset}`
    );
    const devVolumes = execCommand(
      "docker volume ls -q --filter name=zephyr_*_dev"
    );
    if (devVolumes) {
      execSync(`docker volume rm ${devVolumes}`, {
        stdio: "inherit",
        cwd: PROJECT_ROOT
      });
    }

    console.log(
      `${colors.green}✨ Development environment cleaned${colors.reset}`
    );
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

async function cleanProdEnvironment() {
  console.log(
    `${colors.red}🧹 Cleaning Production Environment...${colors.reset}`
  );

  const confirm = await question(
    "⚠️  WARNING: This will remove all production data! Are you absolutely sure? (yes/N) "
  );
  if (confirm !== "yes") {
    console.log(`${colors.red}❌ Operation cancelled${colors.reset}`);
    return;
  }

  try {
    console.log(
      `${colors.yellow}🛑 Stopping production containers...${colors.reset}`
    );
    execSync(
      `docker compose -f "${PROD_COMPOSE_FILE}" down -v --remove-orphans`,
      {
        stdio: "inherit",
        cwd: PROJECT_ROOT
      }
    );

    console.log(
      `${colors.yellow}🗑️  Removing production volumes...${colors.reset}`
    );
    const prodVolumes = execCommand(
      "docker volume ls -q --filter name=zephyr_*_prod"
    );
    if (prodVolumes) {
      execSync(`docker volume rm ${prodVolumes}`, {
        stdio: "inherit",
        cwd: PROJECT_ROOT
      });
    }

    console.log(
      `${colors.green}✨ Production environment cleaned${colors.reset}`
    );
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

async function cleanAllDocker() {
  console.log(
    `${colors.magenta}🧹 Cleaning All Docker Resources...${colors.reset}`
  );

  const confirm = await question(
    "⚠️  WARNING: This will remove ALL Docker resources! Continue? (yes/N) "
  );
  if (confirm !== "yes") {
    console.log(`${colors.red}❌ Operation cancelled${colors.reset}`);
    return;
  }

  try {
    console.log(`${colors.yellow}🛑 Stopping all containers...${colors.reset}`);
    const containers = execCommand("docker ps -aq", true);
    if (containers) {
      execSync(`docker stop ${containers}`, {
        stdio: "inherit",
        cwd: PROJECT_ROOT
      });
      execSync(`docker rm ${containers}`, {
        stdio: "inherit",
        cwd: PROJECT_ROOT
      });
    }

    console.log(`${colors.yellow}🧹 Removing all images...${colors.reset}`);
    const images = execCommand("docker images -q", true);
    if (images) {
      execSync(`docker rmi -f ${images}`, {
        stdio: "inherit",
        cwd: PROJECT_ROOT
      });
    }

    console.log(`${colors.yellow}📦 Removing all volumes...${colors.reset}`);
    const volumes = execCommand("docker volume ls -q", true);
    if (volumes) {
      execSync(`docker volume rm ${volumes}`, {
        stdio: "inherit",
        cwd: PROJECT_ROOT
      });
    }

    console.log(`${colors.yellow}🌐 Removing all networks...${colors.reset}`);
    execSync("docker network prune -f", {
      stdio: "inherit",
      cwd: PROJECT_ROOT
    });

    console.log(`${colors.yellow}🔄 Cleaning build cache...${colors.reset}`);
    execSync("docker builder prune -af", {
      stdio: "inherit",
      cwd: PROJECT_ROOT
    });

    console.log(
      `${colors.green}✨ All Docker resources cleaned${colors.reset}`
    );
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

function showDockerStatus() {
  console.log(`\n${colors.blue}📊 Docker Status${colors.reset}`);
  console.log(
    `${colors.gray}----------------------------------------${colors.reset}`
  );

  try {
    console.log(`${colors.cyan}🐋 Running Containers:${colors.reset}`);
    execSync('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"', {
      stdio: "inherit",
      cwd: PROJECT_ROOT
    });

    console.log(`\n${colors.cyan}💾 Volumes:${colors.reset}`);
    execSync('docker volume ls --format "table {{.Name}}\t{{.Driver}}"', {
      stdio: "inherit",
      cwd: PROJECT_ROOT
    });

    console.log(`\n${colors.cyan}🌐 Networks:${colors.reset}`);
    execSync(
      'docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"',
      {
        stdio: "inherit",
        cwd: PROJECT_ROOT
      }
    );

    console.log(`\n${colors.cyan}📦 Images:${colors.reset}`);
    execSync(
      'docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"',
      {
        stdio: "inherit",
        cwd: PROJECT_ROOT
      }
    );

    console.log(`\n${colors.cyan}💽 Disk Usage:${colors.reset}`);
    execSync("docker system df", {
      stdio: "inherit",
      cwd: PROJECT_ROOT
    });
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

async function main() {
  console.clear();
  showBanner();

  while (true) {
    showMenu();
    const choice = await question("\n👉 Enter your choice: ");

    switch (choice) {
      case "1":
        await cleanDevEnvironment();
        break;
      case "2":
        await cleanProdEnvironment();
        break;
      case "3":
        await cleanAllDocker();
        break;
      case "4":
        showDockerStatus();
        break;
      case "5":
        console.log(`${colors.cyan}👋 Goodbye!${colors.reset}`);
        rl.close();
        return;
      default:
        console.log(`${colors.red}❌ Invalid choice${colors.reset}`);
    }

    await question("\nPress Enter to continue...");
    console.clear();
    showBanner();
  }
}

main().catch(console.error);
