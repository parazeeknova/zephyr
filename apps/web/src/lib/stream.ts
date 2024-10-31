import { StreamChat } from "stream-chat";

if (!process.env.NEXT_PUBLIC_STREAM_KEY || !process.env.STREAM_SECRET) {
  throw new Error("Stream credentials are not properly configured");
}

const streamServerClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_KEY,
  process.env.STREAM_SECRET,
  { timeout: 15000 }
);

export const getStreamClient = () => streamServerClient;

export const generateStreamUserToken = (userId: string) => {
  if (!streamServerClient) {
    throw new Error("Stream client not initialized");
  }
  return streamServerClient.createToken(userId);
};
