import { useSession } from "@/app/(main)/SessionProvider";
import kyInstance from "@/lib/ky";
import { isStreamConfigured } from "@zephyr/config/src/env";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Use this to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      if (!isClient) return;

      const streamKey = process.env.NEXT_PUBLIC_STREAM_KEY;
      const configStatus = isStreamConfigured();

      console.debug("[Stream Init Debug]", {
        hasStreamKey: !!streamKey,
        isConfigured: configStatus,
        isClient,
        hasUser: !!user?.id
      });

      if (!streamKey || !configStatus) {
        if (isMounted) {
          setError(
            "Stream Chat is not configured - chat features are disabled"
          );
        }
        return;
      }

      try {
        const client = new StreamChat(streamKey);
        const tokenResponse = await kyInstance
          .get("/api/get-token")
          .json<{ token: string | null }>();

        if (!tokenResponse.token) {
          throw new Error("Failed to get Stream Chat token");
        }

        if (!user?.id || !user?.username) {
          throw new Error("User information is missing");
        }

        await client.connectUser(
          {
            id: user.id,
            username: user.username,
            name: user.displayName || user.username,
            image: user.avatarUrl || undefined
          },
          tokenResponse.token
        );

        if (isMounted) {
          setChatClient(client);
          setError(null);
        }
      } catch (err) {
        console.error("[Stream Chat] Initialization error:", err);
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to initialize chat client"
          );
          setChatClient(null);
        }
      }
    };

    if (user?.id && isClient) {
      initializeChat();
    }

    return () => {
      isMounted = false;
      if (chatClient) {
        chatClient
          .disconnectUser()
          .catch((err) => console.error("[Stream Chat] Disconnect error:", err))
          .finally(() => {
            if (isMounted) {
              setChatClient(null);
              setError(null);
            }
          });
      }
    };
  }, [user?.id, user?.username, user?.displayName, user?.avatarUrl, isClient]);

  const isConfigured = isClient ? isStreamConfigured() : false;

  return {
    chatClient,
    error,
    isLoading: !isClient || (!chatClient && !error),
    isConfigured
  };
}
