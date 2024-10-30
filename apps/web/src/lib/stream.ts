import { StreamChat } from "stream-chat";

// Dynamic import to prevent build-time validation
export const getStreamClient = async () => {
  if (process.env.NEXT_PUBLIC_STREAM_KEY && process.env.STREAM_SECRET) {
    return StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_KEY,
      process.env.STREAM_SECRET
    );
  }
  return null;
};
