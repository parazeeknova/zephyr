import { useSession } from "@/app/(main)/SessionProvider";
import kyInstance from "@/lib/ky";
import { isStreamConfigured } from "@zephyr/config/src/env";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      if (!isStreamConfigured()) {
        setError("Stream Chat is not configured - chat features are disabled");
        return;
      }

      const streamKey = process.env.NEXT_PUBLIC_STREAM_KEY;
      if (!streamKey) {
        setError("Stream Chat API key is missing");
        return;
      }

      try {
        const client = StreamChat.getInstance(streamKey);
        const tokenResponse = await kyInstance
          .get("/api/get-token")
          .json<{ token: string | null }>();

        if (!tokenResponse.token) {
          throw new Error("Failed to get Stream Chat token");
        }

        await client.connectUser(
          {
            id: user.id,
            username: user.username,
            name: user.displayName,
            image: user.avatarUrl
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

    if (user?.id) {
      initializeChat();
    }

    return () => {
      isMounted = false;
      if (chatClient) {
        chatClient
          .disconnectUser()
          .catch((err) => {
            console.error("[Stream Chat] Disconnect error:", err);
          })
          .finally(() => {
            if (isMounted) {
              setChatClient(null);
              setError(null);
            }
          });
      }
    };
  }, [user?.id, user?.username, user?.displayName, user?.avatarUrl]);

  return {
    chatClient,
    error,
    isLoading: !chatClient && !error,
    isConfigured: isStreamConfigured()
  };
}
