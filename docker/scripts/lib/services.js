const { execSync } = require("node:child_process");
const colors = require("./colors");
const { createStatusTable } = require("./ui");
const os = require("node:os");

const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
let spinnerIndex = 0;

const getSpinnerFrame = () => {
  spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
  return spinnerFrames[spinnerIndex];
};

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
  const tableWidth = 58;
  const padding = Math.max(0, Math.floor((terminalWidth - tableWidth) / 2));
  const paddingStr = " ".repeat(padding);

  const centerText = (text, width = terminalWidth) => {
    const spaces = Math.max(0, Math.floor((width - text.length) / 2));
    return " ".repeat(spaces) + text;
  };

  const renderTable = async () => {
    console.clear();
    console.log("\n");
    console.log(
      centerText(`${colors.blue}🚀 Initializing Services${colors.reset}`)
    );
    console.log("\n");

    const table = [
      `${colors.gray}┌───────────────┬──────────────────────────────┬──────────┐${colors.reset}`,
      `${colors.gray}│${colors.blue} SERVICE       ${colors.gray}│${colors.blue} ENDPOINT                     ${colors.gray}│${colors.blue} STATUS   ${colors.gray}│${colors.reset}`,
      `${colors.gray}├───────────────┼──────────────────────────────┼──────────┤${colors.reset}`
    ];

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
        statusSymbol = getSpinnerFrame();
        statusColor = colors.yellow;
      }

      table.push(
        `${colors.gray}│${colors.reset} ${name.padEnd(13)}${colors.gray}│${colors.reset} ${url.padEnd(28)}${colors.gray}│${statusColor} ${statusSymbol}${" ".repeat(8)}${colors.gray}│${colors.reset}`
      );
    }

    table.push(
      `${colors.gray}└───────────────┴──────────────────────────────┴──────────┘${colors.reset}`
    );

    for (const line of table) {
      console.log(paddingStr + line);
    }

    console.log("\n");
    console.log(
      centerText(
        `${colors.dim}⚠️  Initialization time may vary based on system performance${colors.reset}`
      )
    );
    console.log(
      centerText(
        `${colors.dim}💡 Please wait while services are being configured...${colors.reset}`
      )
    );
    console.log("\n");
  };

  let lastUpdate = Date.now();
  const updateInterval = 100;

  for (const [_key, service] of Object.entries({
    prisma: {
      name: "Prisma Migrations",
      container: "zephyr-prisma-migrate",
      successPattern: "🎉 Database initialization complete",
      errorPattern: "Error:|error:|prisma:error"
    }
  })) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const logs = getDockerLogs(service.container);

        if (logs.includes(service.successPattern)) {
          initStatus["Init Services"].status = "Ready";
          await renderTable();
          return true;
        }

        if (logs.match(service.errorPattern)) {
          initStatus["Init Services"].status = "Failed";
          await renderTable();
          console.log(
            centerText(`${colors.red}❌ Initialization Failed${colors.reset}`)
          );
          return false;
        }

        const now = Date.now();
        if (now - lastUpdate >= updateInterval) {
          await renderTable();
          lastUpdate = now;
        }

        if (attempt === maxAttempts) {
          initStatus["Init Services"].status = "Failed";
          await renderTable();
          console.log(
            centerText(
              `${colors.red}❌ Initialization Timed Out${colors.reset}`
            )
          );
          return false;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
        // biome-ignore lint/correctness/noUnusedVariables: ignore
      } catch (error) {
        initStatus["Init Services"].status = "Failed";
        await renderTable();
        console.log(
          centerText(`${colors.red}❌ Initialization Error${colors.reset}`)
        );
        return false;
      }
    }
  }

  return true;
}

module.exports = {
  waitForServices: checkServices,
  waitForInitServices
};
