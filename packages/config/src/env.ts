type StreamConfig = {
  apiKey: string | null;
  secret: string | null;
};

type EnvStatus = {
  isConfigured: boolean;
  missingVars: string[];
  isDevelopment: boolean;
};

const REQUIRED_STREAM_VARS = {
  NEXT_PUBLIC_STREAM_KEY: process.env.NEXT_PUBLIC_STREAM_KEY,
  STREAM_SECRET: process.env.STREAM_SECRET
} as const;

const isProduction = process.env.NODE_ENV === "production";
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const isTestEnvironment = process.env.NODE_ENV === "test";
const skipValidation = process.env.NEXT_PUBLIC_SKIP_VALIDATION === "true";
const isDevelopment = !isProduction && !isBuildPhase && !isTestEnvironment;

let hasLoggedStreamStatus = false;

/**
 * Check Stream environment configuration status
 */
function checkStreamEnvStatus(): EnvStatus {
  const missingVars = Object.entries(REQUIRED_STREAM_VARS)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  return {
    isConfigured: missingVars.length === 0,
    missingVars,
    isDevelopment
  };
}

/**
 * Validate Stream environment variables
 * Throws in production, logs warning in development
 */
export function validateStreamEnv(): void {
  const { isConfigured, missingVars, isDevelopment } = checkStreamEnvStatus();

  // Skip validation if explicitly requested or during build
  if (skipValidation || isBuildPhase) {
    return;
  }

  if (!isConfigured) {
    const message = `Stream Chat environment variables are not configured. Missing: ${missingVars.join(
      ", "
    )}`;

    if (isProduction) {
      throw new Error(message);
    }
    if (isDevelopment) {
      console.warn("⚠️ [Stream Chat]:", message);
      console.info(
        "ℹ️ [Stream Chat]: Continuing in development mode with disabled Stream features"
      );
    }
  }
}

/**
 * Get Stream configuration
 * Returns null values if not configured in development
 * Throws if not configured in production
 * Development can proceed with null values
 */
export function getStreamConfig(): StreamConfig {
  const { isConfigured, isDevelopment } = checkStreamEnvStatus();

  if (!isConfigured && !isDevelopment) {
    throw new Error(
      "Stream configuration is required in production but values are missing"
    );
  }

  if (!isConfigured) {
    if (isDevelopment && !hasLoggedStreamStatus) {
      console.warn(
        "[Stream Chat] Missing configuration - some features will be disabled"
      );
      hasLoggedStreamStatus = true;
    }
    return {
      apiKey: null,
      secret: null
    };
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_STREAM_KEY ?? null,
    secret: process.env.STREAM_SECRET ?? null
  };
}

/**
 * Check if Stream is properly configured
 * Always return true for production build phase
 * Only log if there's an issue with the configuration
 */
export function isStreamConfigured(): boolean {
  const { isConfigured, isDevelopment } = checkStreamEnvStatus();

  if (isBuildPhase) return true;

  if (isDevelopment && !hasLoggedStreamStatus) {
    const status = {
      hasApiKey: !!process.env.NEXT_PUBLIC_STREAM_KEY,
      hasSecret: !!process.env.STREAM_SECRET,
      isConfigured,
      environment: process.env.NODE_ENV
    };

    if (isConfigured) {
      console.debug("[Stream Chat] Initialized successfully");
    } else {
      console.warn("[Stream Chat] Configuration status:", status);
    }

    hasLoggedStreamStatus = true;
  }

  return isConfigured;
}

/**
 * Get environment mode
 */
export function getEnvironmentMode() {
  return {
    isProduction,
    isDevelopment,
    isBuildPhase,
    isTestEnvironment
  };
}

/**
 * Safely get an environment variable
 * @param key - The environment variable key
 * @param required - Whether the variable is required (throws if missing in production)
 */
export function getEnvVar(
  key: keyof typeof REQUIRED_STREAM_VARS,
  required = false
): string | null {
  const value = process.env[key];

  if (!value && required && !isDevelopment) {
    throw new Error(`Required environment variable ${key} is not set`);
  }

  return value ?? null;
}
