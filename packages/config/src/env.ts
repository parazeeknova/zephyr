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

export function isStreamConfigured(): boolean {
  if (typeof window !== "undefined") {
    return Boolean(process.env.NEXT_PUBLIC_STREAM_KEY);
  }

  const key = process.env.NEXT_PUBLIC_STREAM_KEY;
  const secret = process.env.STREAM_SECRET;
  const isConfigured = Boolean(key && secret);

  if (!hasLoggedStreamStatus) {
    console.debug("[Stream Config]", {
      hasKey: !!key,
      hasSecret: !!secret,
      isConfigured,
      env: process.env.NODE_ENV,
      isServer: typeof window === "undefined"
    });
    hasLoggedStreamStatus = true;
  }

  return isConfigured;
}

export function isStreamConfiguredClient(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(process.env.NEXT_PUBLIC_STREAM_KEY);
}

function checkStreamEnvStatus(): EnvStatus {
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
