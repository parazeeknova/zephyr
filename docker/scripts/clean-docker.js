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
  console.log(`${colors.yellow}🧹 Docker Management Options:${colors.reset}`);
  console.log(
    `${colors.gray}----------------------------------------${colors.reset}`
  );

  // Environment Management
  console.log(`${colors.green}1. Clean Development Environment${colors.reset}`);
  console.log(`${colors.red}2. Clean Production Environment${colors.reset}`);
  console.log(`${colors.magenta}3. Clean All Docker Resources${colors.reset}`);

  // Resource Management
  console.log(`${colors.cyan}4. Cleanup Specific Resources:${colors.reset}`);
  console.log(`   ${colors.gray}a) Remove Dangling Images${colors.reset}`);
  console.log(`   ${colors.gray}b) Remove Unused Networks${colors.reset}`);
  console.log(`   ${colors.gray}c) Remove Unused Volumes${colors.reset}`);
  console.log(`   ${colors.gray}d) Clean Build Cache${colors.reset}`);
  console.log(`   ${colors.gray}e) Remove Exited Containers${colors.reset}`);

  // System Operations
  console.log(`${colors.yellow}5. Docker System Operations:${colors.reset}`);
  console.log(`   ${colors.gray}a) Show Disk Usage${colors.reset}`);
  console.log(`   ${colors.gray}b) Prune System${colors.reset}`);
  console.log(`   ${colors.gray}c) Show Resource Stats${colors.reset}`);

  // Status and Monitoring
  console.log(`${colors.blue}6. Show Docker Status${colors.reset}`);
  console.log(`${colors.magenta}7. System Health Monitoring:${colors.reset}`);
  console.log(`   ${colors.gray}a) Show Resource Usage${colors.reset}`);
  console.log(`   ${colors.gray}b) Show Running Processes${colors.reset}`);
  console.log(`   ${colors.gray}c) Show System Events${colors.reset}`);
  console.log(
    `   ${colors.gray}d) Show Container Health Status${colors.reset}`
  );

  // Container Management
  console.log(`${colors.green}8. Container Operations:${colors.reset}`);
  console.log(`   ${colors.gray}a) Stop All Containers${colors.reset}`);
  console.log(`   ${colors.gray}b) Restart All Containers${colors.reset}`);
  console.log(`   ${colors.gray}c) Show Container Logs${colors.reset}`);

  // Network Management
  console.log(`${colors.cyan}9. Network Management:${colors.reset}`);
  console.log(`   ${colors.gray}a) List Network Details${colors.reset}`);
  console.log(`   ${colors.gray}b) Inspect Network${colors.reset}`);
  console.log(`   ${colors.gray}c) Create Network${colors.reset}`);
  console.log(`   ${colors.gray}d) Remove Network${colors.reset}`);

  // Image Management
  console.log(`${colors.yellow}10. Image Management:${colors.reset}`);
  console.log(`   ${colors.gray}a) List Images with Details${colors.reset}`);
  console.log(`   ${colors.gray}b) Search Docker Hub${colors.reset}`);
  console.log(`   ${colors.gray}c) Pull Image${colors.reset}`);
  console.log(`   ${colors.gray}d) Remove Image${colors.reset}`);
  console.log(`   ${colors.gray}e) Image History${colors.reset}`);
  console.log(`   ${colors.gray}f) Export Image${colors.reset}`);

  // Volume Management
  console.log(`${colors.magenta}11. Volume Management:${colors.reset}`);
  console.log(`   ${colors.gray}a) List Volumes with Details${colors.reset}`);
  console.log(`   ${colors.gray}b) Inspect Volume${colors.reset}`);
  console.log(`   ${colors.gray}c) Create Volume${colors.reset}`);
  console.log(`   ${colors.gray}d) Remove Volume${colors.reset}`);
  console.log(`   ${colors.gray}e) Backup Volume${colors.reset}`);

  // Exit
  console.log(`${colors.red}12. Exit${colors.reset}`);
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

async function cleanupSpecificResources() {
  console.log(`${colors.cyan}🧹 Cleanup Specific Resources${colors.reset}`);
  console.log("\na) Remove Dangling Images");
  console.log("b) Remove Unused Networks");
  console.log("c) Remove Unused Volumes");
  console.log("d) Clean Build Cache");
  console.log("e) Remove Exited Containers");

  const choice = await question("\nEnter your choice (a-e): ");

  try {
    switch (choice.toLowerCase()) {
      case "a":
        console.log(
          `${colors.yellow}🧹 Removing dangling images...${colors.reset}`
        );
        execSync("docker image prune -f", { stdio: "inherit" });
        break;
      case "b":
        console.log(
          `${colors.yellow}🧹 Removing unused networks...${colors.reset}`
        );
        execSync("docker network prune -f", { stdio: "inherit" });
        break;
      case "c":
        console.log(
          `${colors.yellow}🧹 Removing unused volumes...${colors.reset}`
        );
        execSync("docker volume prune -f", { stdio: "inherit" });
        break;
      case "d":
        console.log(
          `${colors.yellow}🧹 Cleaning build cache...${colors.reset}`
        );
        execSync("docker builder prune -f", { stdio: "inherit" });
        break;
      case "e":
        console.log(
          `${colors.yellow}🧹 Removing exited containers...${colors.reset}`
        );
        execSync("docker container prune -f", { stdio: "inherit" });
        break;
      default:
        console.log(`${colors.red}Invalid choice${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

async function dockerSystemOperations() {
  console.log(`${colors.yellow}🐋 Docker System Operations${colors.reset}`);
  console.log("\na) Show Disk Usage");
  console.log("b) Prune System");
  console.log("c) Show Resource Stats");

  const choice = await question("\nEnter your choice (a-c): ");

  try {
    switch (choice.toLowerCase()) {
      case "a":
        console.log(`${colors.cyan}📊 Docker Disk Usage:${colors.reset}`);
        execSync("docker system df -v", { stdio: "inherit" });
        break;
      case "b": {
        const confirm = await question(
          "⚠️  This will remove all unused data. Continue? (y/N) "
        );
        if (confirm.toLowerCase() === "y") {
          execSync("docker system prune -af", { stdio: "inherit" });
        }
        break;
      }
      case "c":
        console.log(`${colors.cyan}📊 Resource Statistics:${colors.reset}`);
        execSync("docker stats --no-stream", { stdio: "inherit" });
        break;
      default:
        console.log(`${colors.red}Invalid choice${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

async function containerOperations() {
  console.log(`${colors.magenta}🐳 Container Operations${colors.reset}`);
  console.log("\na) Stop All Containers");
  console.log("b) Restart All Containers");
  console.log("c) Show Container Logs");

  const choice = await question("\nEnter your choice (a-c): ");

  try {
    switch (choice.toLowerCase()) {
      case "a":
        console.log(
          `${colors.yellow}🛑 Stopping all containers...${colors.reset}`
        );
        execCommand("docker stop $(docker ps -q)", true);
        break;
      case "b":
        console.log(
          `${colors.yellow}🔄 Restarting all containers...${colors.reset}`
        );
        execCommand("docker restart $(docker ps -q)", true);
        break;
      case "c": {
        const containers = execCommand('docker ps --format "{{.Names}}"').split(
          "\n"
        );
        console.log("\nAvailable containers:");
        containers.forEach((container, index) => {
          console.log(`${index + 1}) ${container}`);
        });
        const containerChoice = await question("\nEnter container number: ");
        const selectedContainer =
          containers[Number.parseInt(containerChoice) - 1];
        if (selectedContainer) {
          execSync(`docker logs --tail 100 -f ${selectedContainer}`, {
            stdio: "inherit"
          });
        }
        break;
      }
      default:
        console.log(`${colors.red}Invalid choice${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

async function networkManagement() {
  console.log(`${colors.cyan}🌐 Network Management${colors.reset}`);
  console.log("\na) List Network Details");
  console.log("b) Inspect Network");
  console.log("c) Create Network");
  console.log("d) Remove Network");

  const choice = await question("\nEnter your choice (a-d): ");

  try {
    switch (choice.toLowerCase()) {
      case "a":
        execSync(
          'docker network ls --format "table {{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}"',
          { stdio: "inherit" }
        );
        break;
      case "b": {
        const networks = execCommand(
          'docker network ls --format "{{.Name}}"'
        ).split("\n");
        console.log("\nAvailable networks:");
        networks.forEach((net, index) => console.log(`${index + 1}) ${net}`));
        const netChoice = await question("\nEnter network number: ");
        const selectedNetwork = networks[Number.parseInt(netChoice) - 1];
        if (selectedNetwork) {
          execSync(`docker network inspect ${selectedNetwork}`, {
            stdio: "inherit"
          });
        }
        break;
      }
      case "c": {
        const netName = await question("Enter network name: ");
        const driver = await question(
          "Enter driver (bridge/overlay/host/none): "
        );
        execSync(`docker network create --driver ${driver} ${netName}`, {
          stdio: "inherit"
        });
        break;
      }
      case "d": {
        const netToRemove = await question("Enter network name to remove: ");
        execSync(`docker network rm ${netToRemove}`, { stdio: "inherit" });
        break;
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

async function imageManagement() {
  console.log(`${colors.cyan}📦 Image Management${colors.reset}`);
  console.log("\na) List Images with Details");
  console.log("b) Search Docker Hub");
  console.log("c) Pull Image");
  console.log("d) Remove Image");
  console.log("e) Image History");
  console.log("f) Export Image");

  const choice = await question("\nEnter your choice (a-f): ");

  try {
    switch (choice.toLowerCase()) {
      case "a":
        execSync(
          'docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"',
          { stdio: "inherit" }
        );
        break;
      case "b": {
        const searchTerm = await question("Enter search term: ");
        execSync(
          `docker search ${searchTerm} --format "table {{.Name}}\t{{.Description}}\t{{.Stars}}"`,
          { stdio: "inherit" }
        );
        break;
      }
      case "c": {
        const imageToPull = await question(
          "Enter image name (e.g., nginx:latest): "
        );
        execSync(`docker pull ${imageToPull}`, { stdio: "inherit" });
        break;
      }
      case "d": {
        const imageToRemove = await question("Enter image name to remove: ");
        execSync(`docker rmi ${imageToRemove}`, { stdio: "inherit" });
        break;
      }
      case "e": {
        const imageHistory = await question("Enter image name: ");
        execSync(
          `docker history ${imageHistory} --format "table {{.ID}}\t{{.CreatedSince}}\t{{.Size}}\t{{.Comment}}"`,
          { stdio: "inherit" }
        );
        break;
      }
      case "f": {
        const imageToExport = await question("Enter image name: ");
        const exportPath = await question(
          "Enter export path (e.g., ./backup.tar): "
        );
        execSync(`docker save -o ${exportPath} ${imageToExport}`, {
          stdio: "inherit"
        });
        break;
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

async function volumeManagement() {
  console.log(`${colors.cyan}💾 Volume Management${colors.reset}`);
  console.log("\na) List Volumes with Details");
  console.log("b) Inspect Volume");
  console.log("c) Create Volume");
  console.log("d) Remove Volume");
  console.log("e) Backup Volume");

  const choice = await question("\nEnter your choice (a-e): ");

  try {
    switch (choice.toLowerCase()) {
      case "a":
        execSync(
          'docker volume ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"',
          { stdio: "inherit" }
        );
        break;
      case "b": {
        const volumes = execCommand(
          'docker volume ls --format "{{.Name}}"'
        ).split("\n");
        console.log("\nAvailable volumes:");
        volumes.forEach((vol, index) => console.log(`${index + 1}) ${vol}`));
        const volChoice = await question("\nEnter volume number: ");
        const selectedVolume = volumes[Number.parseInt(volChoice) - 1];
        if (selectedVolume) {
          execSync(`docker volume inspect ${selectedVolume}`, {
            stdio: "inherit"
          });
        }
        break;
      }
      case "c": {
        const volName = await question("Enter volume name: ");
        execSync(`docker volume create ${volName}`, { stdio: "inherit" });
        break;
      }
      case "d": {
        const volToRemove = await question("Enter volume name to remove: ");
        execSync(`docker volume rm ${volToRemove}`, { stdio: "inherit" });
        break;
      }
      case "e": {
        const volToBackup = await question("Enter volume name: ");
        const backupPath = await question(
          "Enter backup path (e.g., ./volume-backup.tar): "
        );
        execSync(
          `docker run --rm -v ${volToBackup}:/source -v $(pwd):/backup alpine tar -czf /backup/${backupPath} -C /source .`,
          { stdio: "inherit" }
        );
        break;
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

async function systemHealthMonitoring() {
  console.log(`${colors.cyan}🏥 System Health Monitoring${colors.reset}`);
  console.log("\na) Show Resource Usage");
  console.log("b) Show Running Processes");
  console.log("c) Show System Events");
  console.log("d) Show Container Health Status");

  const choice = await question("\nEnter your choice (a-d): ");

  try {
    switch (choice.toLowerCase()) {
      case "a":
        execSync(
          'docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"',
          { stdio: "inherit" }
        );
        break;
      case "b":
        execSync("docker top $(docker ps -q)", { stdio: "inherit" });
        break;
      case "c":
        execSync("docker events --since 1h --until now", { stdio: "inherit" });
        break;
      case "d":
        execSync(
          'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}"',
          { stdio: "inherit" }
        );
        break;
    }
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

    try {
      switch (choice) {
        // Environment Management
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
          await cleanupSpecificResources();
          break;
        case "5":
          await dockerSystemOperations();
          break;
        case "6":
          showDockerStatus();
          break;
        case "7":
          await systemHealthMonitoring();
          break;
        case "8":
          await containerOperations();
          break;
        case "9":
          await networkManagement();
          break;
        case "10":
          await imageManagement();
          break;
        case "11":
          await volumeManagement();
          break;
        case "12":
          console.log(`${colors.cyan}👋 Goodbye!${colors.reset}`);
          rl.close();
          return;
        default:
          console.log(`${colors.red}❌ Invalid choice${colors.reset}`);
      }
    } catch (error) {
      handleError(error, `executing option ${choice}`);
    }

    await question("\nPress Enter to continue...");
    console.clear();
    showBanner();
  }
}

function handleError(error, operation) {
  console.error(`${colors.red}Error during ${operation}:${colors.reset}`);
  console.error(`${colors.gray}${error.message}${colors.reset}`);

  if (error.stderr) {
    console.error(`${colors.gray}Details: ${error.stderr}${colors.reset}`);
  }

  return false;
}

main().catch(console.error);
