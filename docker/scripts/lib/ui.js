const colors = require("./colors");

function printBanner() {
  console.log(colors.cyan);
  console.log(`
███████╗███████╗██████╗ ██╗  ██╗██╗   ██╗██████╗ 
╚══███╔╝██╔════╝██╔══██╗██║  ██║╚██╗ ██╔╝██╔══██╗
  ███╔╝ █████╗  ██████╔╝███████║ ╚████╔╝ ██████╔╝
 ███╔╝  ██╔══╝  ██╔═══╝ ██╔══██║  ╚██╔╝  ██╔══██╗
███████╗███████╗██║     ██║  ██║   ██║   ██║  ██║
╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
[DEV] Local Development Environment
`);
  console.log(
    `${colors.yellow}📚 Development Server Setup Script${colors.reset}`
  );
  console.log(
    `${colors.gray}----------------------------------------${colors.reset}`
  );
}

async function createStatusTable(services) {
  const maxNameLength = 15;
  const maxUrlLength = 30;
  const maxStatusLength = 10;

  console.log(
    `${colors.gray}┌${"─".repeat(maxNameLength)}┬${"─".repeat(maxUrlLength)}┬${"─".repeat(maxStatusLength)}┐${colors.reset}`
  );
  console.log(
    `${colors.gray}│${colors.blue} SERVICE${" ".repeat(maxNameLength - 8)}${colors.gray}│${colors.blue} ENDPOINT${" ".repeat(maxUrlLength - 9)}${colors.gray}│${colors.blue} STATUS${" ".repeat(maxStatusLength - 7)}${colors.gray}│${colors.reset}`
  );
  console.log(
    `${colors.gray}├${"─".repeat(maxNameLength)}┼${"─".repeat(maxUrlLength)}┼${"─".repeat(maxStatusLength)}┤${colors.reset}`
  );

  for (const [name, { url, status }] of Object.entries(services)) {
    const namePadded = name.padEnd(maxNameLength);
    const urlPadded = url.padEnd(maxUrlLength);
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

    console.log(
      `${colors.gray}│${colors.reset} ${namePadded}${colors.gray}│${colors.reset} ${urlPadded}${colors.gray}│${statusColor} ${statusSymbol}${" ".repeat(maxStatusLength - 2)}${colors.gray}│${colors.reset}`
    );
  }

  console.log(
    `${colors.gray}└${"─".repeat(maxNameLength)}┴${"─".repeat(maxUrlLength)}┴${"─".repeat(maxStatusLength)}┘${colors.reset}`
  );
}

module.exports = {
  printBanner,
  createStatusTable
};
