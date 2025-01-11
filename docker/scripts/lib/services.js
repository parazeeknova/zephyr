const { execSync } = require("node:child_process");
const colors = require("./colors");
const { createStatusTable } = require("./ui");
const os = require("node:os");

const SERVICES = {
  PostgreSQL: {
    name: "PostgreSQL",
    healthCheck:
      "docker exec zephyr-postgres-dev pg_isready -U postgres -d zephyr",
    url: "localhost:5433"
  },
  Redis: {
    name: "Redis",
    healthCheck: "docker exec zephyr-redis-dev redis-cli -a zephyrredis ping",
    url: "localhost:6379"
  },
  MinIO: {
    name: "MinIO",
    url: "http://localhost:9000",
    skipHealthCheck: true
  },
  "MinIO Console": {
    name: "MinIO Console",
    url: "http://localhost:9001",
    skipHealthCheck: true
  }
};

const isWindows = os.platform() === "windows";

const getDockerLogs = (container) => {
  try {
    const command = `docker logs ${container} 2>&1`;
    const logs = execSync(command, { stdio: "pipe" }).toString().trim();

    if (isWindows) {
      const lines = logs.split("\n");
      return lines.slice(-5).join("\n");
    }
    return logs;
    // biome-ignore lint/correctness/noUnusedVariables: No need to handle error
  } catch (error) {
    return "";
  }
};

async function checkService(service, maxAttempts) {
  let success = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (service.skipHealthCheck) {
        const port = service.url.includes(":9001") ? "9001" : "9000";
        await new Promise((resolve, reject) => {
          const net = require("node:net");
          const client = new net.Socket();
          const timeout = setTimeout(() => {
            client.destroy();
            reject(new Error("Timeout"));
          }, 1000);

          client.connect(port, "localhost", () => {
            clearTimeout(timeout);
            client.destroy();
            resolve();
          });

          client.on("error", (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });
        success = true;
      } else {
        execSync(service.healthCheck, { stdio: "pipe" });
        success = true;
      }

      if (success) return true;
      // biome-ignore lint/correctness/noUnusedVariables: ignore
    } catch (error) {
      if (attempt === maxAttempts) return false;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  return false;
}

async function checkServices(maxAttempts = 30) {
  const serviceStatus = {};

  for (const [key, service] of Object.entries(SERVICES)) {
    serviceStatus[key] = {
      url: service.url,
      status: "Waiting"
    };
  }

  let lastUpdate = Date.now();
  const updateInterval = 100;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let allReady = true;

    for (const [key, service] of Object.entries(SERVICES)) {
      if (serviceStatus[key].status === "Ready") continue;

      const success = await checkService(service, 1);
      if (success) {
        serviceStatus[key].status = "Ready";
      } else {
        allReady = false;
      }
    }

    const now = Date.now();
    if (now - lastUpdate >= updateInterval) {
      console.clear();
      await createStatusTable(serviceStatus);
      lastUpdate = now;
    }

    if (allReady) return true;

    if (attempt === maxAttempts) {
      console.clear();
      await createStatusTable(serviceStatus);
      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
}

async function waitForInitServices(maxAttempts = 60) {
  const initStatus = {
    "Init Services": {
      url: "Internal",
      status: "Waiting"
    }
  };

  const terminalWidth = process.stdout.columns || 80;
  const terminalHeight = process.stdout.rows || 24;

  const renderFrame = async (currentAttempt) => {
    process.stdout.write("\x1b[2J\x1b[0f");

    const contentHeight = 12;
    const topPadding = Math.max(
      0,
      Math.floor((terminalHeight - contentHeight) / 2)
    );
    console.log("\n".repeat(topPadding));

    const banner = "🚀 Initializing Services";
    const bannerPadding = " ".repeat(
      Math.max(0, Math.floor((terminalWidth - banner.length) / 2))
    );
    console.log(`${bannerPadding}${colors.blue}${banner}${colors.reset}\n`);

    const progress = Math.min(
      100,
      Math.floor((currentAttempt / maxAttempts) * 100)
    );
    const progressWidth = 40;
    const filled = Math.floor((progressWidth * progress) / 100);
    const empty = progressWidth - filled;
    const progressBar = `[${colors.blue}${"█".repeat(filled)}${colors.gray}${"░".repeat(empty)}${colors.reset}] ${progress}%`;
    const progressPadding = " ".repeat(
      Math.max(0, Math.floor((terminalWidth - progressBar.length) / 2))
    );
    console.log(`${progressPadding}${progressBar}\n`);

    const logs = getDockerLogs("zephyr-prisma-migrate");
    const lastLogLine =
      logs.split("\n").filter(Boolean).pop() || "Waiting for services...";
    const logPadding = " ".repeat(
      Math.max(0, Math.floor((terminalWidth - lastLogLine.length) / 2))
    );
    console.log(`${logPadding}${colors.cyan}${lastLogLine}${colors.reset}\n`);

    const helpText =
      "⚠️  Initialization time may vary based on system performance";
    const helpPadding = " ".repeat(
      Math.max(0, Math.floor((terminalWidth - helpText.length) / 2))
    );
    console.log(`${helpPadding}${colors.dim}${helpText}${colors.reset}`);
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const logs = getDockerLogs("zephyr-prisma-migrate");

      if (logs.includes("🎉 Database initialization complete")) {
        initStatus["Init Services"].status = "Ready";
        await renderFrame(maxAttempts);
        return true;
      }

      if (logs.match(/Error:|error:|prisma:error/)) {
        initStatus["Init Services"].status = "Failed";
        await renderFrame(maxAttempts);
        return false;
      }

      await renderFrame(attempt);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // biome-ignore lint/correctness/noUnusedVariables: ignore
    } catch (error) {
      initStatus["Init Services"].status = "Failed";
      await renderFrame(maxAttempts);
      return false;
    }
  }

  return false;
}

module.exports = {
  waitForServices: checkServices,
  waitForInitServices
};
