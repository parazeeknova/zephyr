import {
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Window
} from "stream-chat-react";

export default function ChatChannel() {
  return (
    <div className="flex-1">
      <Channel>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}
