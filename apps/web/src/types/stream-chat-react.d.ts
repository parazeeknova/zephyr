declare module "stream-chat-react" {
  import type {
    Channel as StreamChannel,
    ChannelSort as StreamChannelSort
  } from "stream-chat";
  import type { ReactNode } from "react";

  export interface ChannelProps {
    channel: StreamChannel;
    children?: ReactNode;
  }

  export interface ChannelHeaderProps {
    live?: boolean;
    title?: string;
    active?: boolean;
    [key: string]: any;
  }

  export interface ChannelListProps {
    filters?: object;
    sort?: StreamChannelSort;
    options?: object;
    showChannelSearch?: boolean;
    additionalChannelSearchProps?: {
      searchForChannels?: boolean;
      searchQueryParams?: {
        channelFilters?: {
          filters?: object;
        };
      };
    };
    Preview?: React.ComponentType<ChannelPreviewUIComponentProps>;
  }

  export interface ChannelPreviewUIComponentProps {
    channel: StreamChannel;
    setActiveChannel?: (channel: StreamChannel, watchers?: object) => void;
    watchers?: object;
    [key: string]: any;
  }

  export const Channel: React.FC<ChannelProps>;
  export const ChannelHeader: React.FC<ChannelHeaderProps>;
  export const ChannelList: React.FC<ChannelListProps>;
  export const ChannelPreviewMessenger: React.FC<ChannelPreviewUIComponentProps>;
  export const MessageInput: React.FC<any>;
  export const MessageList: React.FC<any>;
  export const Window: React.FC<any>;
  export const Chat: React.FC<any>;

  export type DefaultStreamChatGenerics = any;

  export function useChatContext(): {
    setActiveChannel: (channel: StreamChannel) => void;
    [key: string]: any;
  };

  export * from "stream-chat-react";
}
