import { StreamChat } from "stream-chat";

let streamServerClient: StreamChat | null = null;

export function getStreamClient() {
  if (!streamServerClient) {
    if (!process.env.NEXT_PUBLIC_STREAM_KEY || !process.env.STREAM_SECRET) {
      throw new Error("Stream Chat environment variables are not configured");
    }

    streamServerClient = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_KEY,
      process.env.STREAM_SECRET
    );
  }
  return streamServerClient;
}

export default getStreamClient();
