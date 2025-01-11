const { execSync } = require("node:child_process");
const path = require("node:path");
const colors = require("./colors");

const PROJECT_ROOT = path.resolve(__dirname, "../../../");

async function execAsync(command, options = {}) {
  try {
    execSync(command, {
      stdio: options.silent ? "pipe" : "inherit",
      cwd: PROJECT_ROOT,
      ...options
    });
    return true;
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return false;
  }
}

async function waitForContainer(
  containerName,
  healthCheck,
  maxAttempts = 30,
  progressCallback = null
) {
  console.log(
    `${colors.blue}⏳ Waiting for ${containerName}...${colors.reset}`
  );

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = execSync(healthCheck, { stdio: "pipe" }).toString();
      if (result.includes("🎉") || result.includes("✅")) {
        console.log(
          `${colors.green}✅ ${containerName} is ready${colors.reset}`
        );
        return true;
      }
    } catch (_error) {
      if (attempt === maxAttempts) {
        console.error(
          `${colors.red}❌ ${containerName} failed to start${colors.reset}`
        );
        return false;
      }

      if (progressCallback) {
        const shouldContinue = await progressCallback(attempt, maxAttempts);
        if (!shouldContinue) {
          console.error(
            `${colors.red}❌ ${containerName} failed due to error in logs${colors.reset}`
          );
          return false;
        }
      } else {
        process.stdout.write(
          `\r${colors.yellow}⏳ Waiting for ${containerName}... (${attempt}/${maxAttempts})${colors.reset}`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  console.log();
  return false;
}

module.exports = {
  PROJECT_ROOT,
  execAsync,
  waitForContainer
};
