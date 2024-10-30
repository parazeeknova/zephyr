import { StreamChat } from "stream-chat";

let streamClient: StreamChat | null = null;

export const initializeStreamClient = () => {
  if (
    !streamClient &&
    process.env.NEXT_PUBLIC_STREAM_KEY &&
    process.env.STREAM_SECRET
  ) {
    streamClient = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_KEY,
      process.env.STREAM_SECRET
    );
  }
  return streamClient;
};

export const getStreamClient = () => {
  if (!streamClient) {
    return initializeStreamClient();
  }
  return streamClient;
};

// Export a pre-initialized client for backwards compatibility
export const streamServerClient = getStreamClient();

// But prefer using the getter in new code
export default getStreamClient;
