import {
  getEnvironmentMode,
  getStreamConfig,
  isStreamConfigured
} from "@zephyr/config/src/env";
import { StreamChat } from "stream-chat";

const { isDevelopment } = getEnvironmentMode();

let streamClient: StreamChat | null = null;
let hasLoggedClientStatus = false;

export function getStreamClient(): StreamChat | null {
  if (!isStreamConfigured()) {
    if (isDevelopment && !hasLoggedClientStatus) {
      console.log(
        "[Stream Chat] Not configured - skipping client initialization"
      );
      hasLoggedClientStatus = true;
    }
    return null;
  }

  if (streamClient) {
    return streamClient;
  }

  const config = getStreamConfig();
  if (!config.apiKey || !config.secret) {
    if (isDevelopment && !hasLoggedClientStatus) {
      console.log(
        "[Stream Chat] Missing credentials - skipping client initialization"
      );
      hasLoggedClientStatus = true;
    }
    return null;
  }

  try {
    streamClient = StreamChat.getInstance(config.apiKey, config.secret);
    if (isDevelopment && !hasLoggedClientStatus) {
      console.log(
        "[Stream Chat] Client initialized with API key:",
        `${config.apiKey.substring(0, 5)}...`
      );
      hasLoggedClientStatus = true;
    }
    return streamClient;
  } catch (error) {
    console.error("[Stream Chat] Failed to initialize client:", error);
    return null;
  }
}

export const createStreamUser = async (
  userId: string,
  username: string,
  displayName: string
): Promise<void> => {
  if (!isStreamConfigured()) {
    isDevelopment &&
      console.log("[Stream Chat] Not configured - skipping user creation");
    return;
  }

  try {
    const client = await getClientWithRetry();
    if (!client) {
      console.warn(
        "[Stream Chat] Client not available - skipping user creation"
      );
      return;
    }

    isDevelopment &&
      console.log("[Stream Chat] Creating user:", {
        userId: `${userId.substring(0, 5)}...`,
        username: `${username.substring(0, 5)}...`
      });

    await client.upsertUser({
      id: userId,
      username,
      name: displayName
    });

    isDevelopment && console.log("[Stream Chat] User created successfully");
  } catch (error) {
    handleStreamError("create user", error, { userId, username });
  }
};

/**
 * Generate a Stream Chat token for a user
 */
export function generateStreamUserToken(userId: string): string | null {
  if (!isStreamConfigured()) {
    isDevelopment &&
      console.log("[Stream Chat] Not configured - skipping token generation");
    return null;
  }

  try {
    const client = getStreamClient();
    if (!client) {
      console.warn(
        "[Stream Chat] Client not available - skipping token generation"
      );
      return null;
    }

    const token = client.createToken(userId);
    isDevelopment &&
      console.log(
        "[Stream Chat] Generated token for user:",
        `${userId.substring(0, 5)}...`
      );
    return token;
  } catch (error) {
    handleStreamError("generate token", error, { userId });
    return null;
  }
}

/**
 * Helper function to get client with one retry attempt
 */
async function getClientWithRetry(): Promise<StreamChat | null> {
  let client = getStreamClient();

  if (!client) {
    isDevelopment &&
      console.log("[Stream Chat] Client not initialized - retrying once");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    client = getStreamClient();
  }

  return client;
}

/**
 * Standardized error handling for Stream operations
 */
function handleStreamError(
  operation: string,
  error: unknown,
  context: Record<string, unknown> = {}
): void {
  const errorDetails =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error };

  console.error(`[Stream Chat] Failed to ${operation}:`, {
    ...errorDetails,
    ...context
  });
}

/**
 * Type guard for Stream Chat errors
 */
// biome-ignore lint/correctness/noUnusedVariables: used in type guard
function isStreamError(error: unknown): error is Error {
  return error instanceof Error;
}
