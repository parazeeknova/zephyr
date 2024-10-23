import { StreamChat } from "stream-chat";

const streamServerClient = StreamChat.getInstance(
  // biome-ignore lint/style/noNonNullAssertion: This is a public key that is required to be set in the environment else the app will not work
  process.env.NEXT_PUBLIC_STREAM_KEY!,
  process.env.STREAM_SECRET
);

export default streamServerClient;
