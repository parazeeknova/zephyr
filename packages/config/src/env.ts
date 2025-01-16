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

export function validateStreamEnv(): void {
  const { isConfigured, missingVars, isDevelopment } = checkStreamEnvStatus();

  if (skipValidation || isBuildPhase || isTestEnvironment) {
    return;
  }

  if (!isConfigured) {
    const message = `Stream Chat environment variables are not configured. Missing: ${missingVars.join(
      ", "
    )}`;

    if (isDevelopment) {
      console.warn("⚠️ [Stream Chat]:", message);
      console.info(
        "ℹ️ [Stream Chat]: Continuing in development mode with disabled Stream features"
      );
    }
  }
}

export function getStreamConfig(): StreamConfig {
  const { isConfigured, isDevelopment } = checkStreamEnvStatus();

  if (!process.env.NEXT_PUBLIC_STREAM_KEY && !process.env.STREAM_SECRET) {
    if (isDevelopment && !hasLoggedStreamStatus) {
      console.warn("[Stream Chat] Environment variables are not defined");
      hasLoggedStreamStatus = true;
    }
    return {
      apiKey: null,
      secret: null
    };
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
    apiKey: process.env.NEXT_PUBLIC_STREAM_KEY || null,
    secret: process.env.STREAM_SECRET || null
  };
}

let cachedConfig: { key: string | null; secret: string | null } | null = null;

export function isStreamConfigured(): boolean {
  if (!cachedConfig) {
    cachedConfig = {
      key: process.env.NEXT_PUBLIC_STREAM_KEY || null,
      secret: process.env.STREAM_SECRET || null
    };
  }

  if (
    process.env.NEXT_PUBLIC_STREAM_KEY !== cachedConfig.key ||
    process.env.STREAM_SECRET !== cachedConfig.secret
  ) {
    cachedConfig = {
      key: process.env.NEXT_PUBLIC_STREAM_KEY || null,
      secret: process.env.STREAM_SECRET || null
    };
  }

  const isConfigured = Boolean(cachedConfig.key && cachedConfig.secret);

  if (!hasLoggedStreamStatus) {
    console.debug("[Stream Config]", {
      hasKey: !!cachedConfig.key,
      hasSecret: !!cachedConfig.secret,
      isConfigured
    });
    hasLoggedStreamStatus = true;
  }

  return isConfigured;
}

function checkStreamEnvStatus(): EnvStatus {
  // Always consider not configured during SSR
  if (typeof window === "undefined") {
    return {
      isConfigured: false,
      missingVars: [],
      isDevelopment
    };
  }

  const vars = {
    NEXT_PUBLIC_STREAM_KEY: process.env.NEXT_PUBLIC_STREAM_KEY,
    STREAM_SECRET: process.env.STREAM_SECRET
  };

  const missingVars = Object.entries(vars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  return {
    isConfigured: missingVars.length === 0,
    missingVars,
    isDevelopment
  };
}

export function getEnvironmentMode() {
  return {
    isProduction,
    isDevelopment,
    isBuildPhase,
    isTestEnvironment
  };
}

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
