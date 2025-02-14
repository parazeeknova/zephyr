import { useSession } from '@/app/(main)/SessionProvider';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { MailPlus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { ChannelSort } from 'stream-chat';
import {
  ChannelList,
  ChannelPreviewMessenger,
  type ChannelPreviewUIComponentProps,
  type DefaultStreamChatGenerics,
  useChatContext,
} from 'stream-chat-react';
import { Button } from '../ui/button';
import NewChatDialog from './NewChatDialog';

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
  onChannelSelect?: (channel: any) => void;
}

export default function ChatSidebar({
  open,
  onClose,
  onChannelSelect,
}: ChatSidebarProps) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { setActiveChannel } = useChatContext();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
  }, [queryClient]);

  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => {
          props.setActiveChannel?.(props.channel, props.watchers);
          if (onChannelSelect) {
            onChannelSelect(props.channel);
          }
          onClose();
        }}
      />
    ),
    [onClose, onChannelSelect]
  );

  const filters = {
    type: 'messaging',
    members: { $in: [user.id] },
  };

  const options = {
    state: true,
    presence: true,
    limit: 8,
  };

  const sort: ChannelSort<DefaultStreamChatGenerics> = {
    last_message_at: -1 as const,
  };

  return (
    <div
      className={cn(
        'size-full flex-col border-e md:flex md:w-72',
        open ? 'flex' : 'hidden'
      )}
    >
      <MenuHeader
        onClose={onClose}
        onChatCreated={(channel) => {
          setActiveChannel(channel);
          if (onChannelSelect) {
            onChannelSelect(channel);
          }
          onClose();
        }}
      />
      <ChannelList
        filters={filters}
        sort={sort}
        options={options}
        showChannelSearch
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters: {
                members: { $in: [user.id] },
              },
            },
          },
        }}
        Preview={ChannelPreviewCustom}
      />
    </div>
  );
}

interface MenuHeaderProps {
  onClose: () => void;
  onChatCreated: (channel: any) => void;
}

function MenuHeader({ onClose, onChatCreated }: MenuHeaderProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 p-2">
        <div className="h-full md:hidden">
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>
        <h1 className="me-auto font-bold text-xl md:ms-2">Whispers</h1>
        <Button
          size="icon"
          variant="ghost"
          title="Start new whisper"
          onClick={() => setShowNewChatDialog(true)}
        >
          <MailPlus className="size-5" />
        </Button>
      </div>
      {showNewChatDialog && (
        <NewChatDialog
          onOpenChange={setShowNewChatDialog}
          onChatCreated={(channel) => {
            setShowNewChatDialog(false);
            onChatCreated(channel);
          }}
        />
      )}
    </>
  );
}
