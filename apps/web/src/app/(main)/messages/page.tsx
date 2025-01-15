import Chat from "@zephyr-ui/Messages/Chat";
import { isStreamConfigured } from "@zephyr/config/src/env";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Whispers",
  description: "Zephyr Whispers"
};

export default function Page() {
  if (!isStreamConfigured()) {
    redirect("/messages/not-configured");
  }

  return <Chat />;
}
