import { useSession } from "@/app/(main)/SessionProvider";
import { ChannelList } from "stream-chat-react";

export default function ChatSidebar() {
  const { user } = useSession();

  return (
    <div className="flex size-full flex-col border-e md:w-72">
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [user.id] }
        }}
        showChannelSearch
      />
    </div>
  );
}
