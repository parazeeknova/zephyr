import { getEnvironmentMode, isStreamConfigured } from "@zephyr/config/src/env";
import { StreamChat } from "stream-chat";

const { isDevelopment } = getEnvironmentMode();

let streamClient: StreamChat | null = null;

export function getStreamClient(): StreamChat | null {
  if (streamClient) {
    return streamClient;
  }

  const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY;
  const apiSecret =
    typeof window === "undefined" ? process.env.STREAM_SECRET : undefined;
  const isProd = process.env.NODE_ENV === "production";

  console.debug("[Stream Client Init]", {
    hasApiKey: !!apiKey,
    hasSecret: !!apiSecret,
    env: process.env.NODE_ENV,
    isServer: typeof window === "undefined",
    isProd
  });

  if (typeof window !== "undefined") {
    if (!apiKey) {
      isProd
        ? console.error("[Stream Client] Missing API key in production")
        : console.warn("[Stream Client] Missing API key in development");
      return null;
    }

    try {
      streamClient = StreamChat.getInstance(apiKey);
      console.debug("[Stream Client] Successfully initialized (client-side)");
      return streamClient;
    } catch (error) {
      console.error("[Stream Client] Initialization error:", error);
      return null;
    }
  }

  if (!apiKey || !apiSecret) {
    console.error("[Stream Client] Missing server credentials", {
      hasApiKey: !!apiKey,
      hasSecret: !!apiSecret
    });
    return null;
  }

  try {
    streamClient = StreamChat.getInstance(apiKey, apiSecret);
    console.debug("[Stream Client] Successfully initialized (server-side)");
    return streamClient;
  } catch (error) {
    console.error("[Stream Client] Initialization error:", error);
    return null;
  }
}

export const createStreamUser = async (
  userId: string,
  username: string,
  displayName: string,
  avatarUrl?: string | null,
  bio?: string | null
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
        username: `${username.substring(0, 5)}...`,
        displayName
      });

    await client.upsertUser({
      id: userId,
      username,
      name: displayName,
      image: avatarUrl || undefined,
      bio: bio || undefined
    });

    isDevelopment && console.log("[Stream Chat] User created successfully");
  } catch (error) {
    handleStreamError("create user", error, { userId, username });
  }
};

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

// biome-ignore lint/correctness/noUnusedVariables: used in type guard
function isStreamError(error: unknown): error is Error {
  return error instanceof Error;
}
