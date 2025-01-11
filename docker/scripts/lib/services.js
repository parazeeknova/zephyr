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

  const renderTable = async () => {
    console.clear();

    // Calculate vertical centering
    const totalLines = 10; // Banner + Table + Messages
    const topPadding = Math.max(
      0,
      Math.floor((terminalHeight - totalLines) / 2)
    );
    console.log("\n".repeat(topPadding));

    // Centered banner
    const banner = `${colors.blue}🚀 Initializing Services${colors.reset}`;
    const bannerPadding = Math.max(
      0,
      Math.floor((terminalWidth - banner.length) / 2)
    );
    console.log(`${" ".repeat(bannerPadding) + banner}\n`);

    // Table constants
    const tableWidth = 58;
    const tablePadding = Math.max(
      0,
      Math.floor((terminalWidth - tableWidth) / 2)
    );
    const paddingStr = " ".repeat(tablePadding);

    // Progress calculation
    const progress = Math.min(100, Math.floor((attempt / maxAttempts) * 100));
    const progressWidth = 50;
    const filledWidth = Math.floor((progressWidth * progress) / 100);
    const emptyWidth = progressWidth - filledWidth;
    const progressBar = `${colors.blue}[${"■".repeat(filledWidth)}${"□".repeat(emptyWidth)}] ${progress}%${colors.reset}`;

    // Render table
    const table = [
      `${colors.gray}┌───────────────┬──────────────────────────────┬──────────┐${colors.reset}`,
      `${colors.gray}│${colors.blue} SERVICE       ${colors.gray}│${colors.blue} ENDPOINT                     ${colors.gray}│${colors.blue} STATUS   ${colors.gray}│${colors.reset}`,
      `${colors.gray}├───────────────┼──────────────────────────────┼──────────┤${colors.reset}`
    ];

    // Service status row
    for (const [name, { url, status }] of Object.entries(initStatus)) {
      let statusSymbol;
      let statusColor;

      if (status === "Ready") {
        statusSymbol = "✓";
        statusColor = colors.green;
      } else if (status === "Failed") {
        statusSymbol = "✗";
        statusColor = colors.red;
      } else {
        statusSymbol = spinnerFrames[spinnerIndex];
        statusColor = colors.yellow;
      }

      table.push(
        `${colors.gray}│${colors.reset} ${name.padEnd(13)}${colors.gray}│${colors.reset} ${url.padEnd(28)}${colors.gray}│${statusColor} ${statusSymbol}${" ".repeat(8)}${colors.gray}│${colors.reset}`
      );
    }

    table.push(
      `${colors.gray}└───────────────┴──────────────────────────────┴──────────┘${colors.reset}`
    );

    // Render centered table
    // biome-ignore lint/complexity/noForEach: ignore
    table.forEach((line) => console.log(paddingStr + line));

    // Progress bar and messages
    console.log(`\n${" ".repeat(tablePadding)}${progressBar}`);
    console.log(
      `\n${" ".repeat(tablePadding)}${colors.dim}⚠️  Initialization time may vary based on system performance${colors.reset}`
    );
    console.log(
      `${" ".repeat(tablePadding)}${colors.dim}💡 Please wait while services are being configured...${colors.reset}`
    );
  };

  let lastUpdate = Date.now();
  const updateInterval = 100;
  let spinnerIndex = 0;
  const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const logs = getDockerLogs("zephyr-prisma-migrate");

      if (logs.includes("🎉 Database initialization complete")) {
        initStatus["Init Services"].status = "Ready";
        await renderTable();
        return true;
      }

      if (logs.match(/Error:|error:|prisma:error/)) {
        initStatus["Init Services"].status = "Failed";
        await renderTable();
        console.log(
          `\n${" ".repeat(tablePadding)}${colors.red}❌ Initialization Failed${colors.reset}`
        );
        return false;
      }

      const now = Date.now();
      if (now - lastUpdate >= updateInterval) {
        spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
        await renderTable();
        lastUpdate = now;
      }

      if (attempt === maxAttempts) {
        initStatus["Init Services"].status = "Failed";
        await renderTable();
        console.log(
          `\n${" ".repeat(tablePadding)}${colors.red}❌ Initialization Timed Out${colors.reset}`
        );
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      // biome-ignore lint/correctness/noUnusedVariables: ignore
    } catch (error) {
      initStatus["Init Services"].status = "Failed";
      await renderTable();
      console.log(
        `\n${" ".repeat(tablePadding)}${colors.red}❌ Initialization Error${colors.reset}`
      );
      return false;
    }
  }

  return false;
}

module.exports = {
  waitForServices: checkServices,
  waitForInitServices
};
