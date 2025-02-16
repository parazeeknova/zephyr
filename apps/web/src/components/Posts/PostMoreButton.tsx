import { MentionTags } from '@/components/Tags/MentionTags';
import { Tags as TagsComponent } from '@/components/Tags/Tags';
import type { PostData, TagWithCount, UserData } from '@zephyr/db';
import { Button } from '@zephyr/ui/shadui/button';
import { Dialog, DialogContent, DialogTitle } from '@zephyr/ui/shadui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@zephyr/ui/shadui/dropdown-menu';
import { AtSign, MoreHorizontal, Tags, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import DeletePostDialog from './DeletePostDialog';

interface PostMoreButtonProps {
  post: PostData;
  className?: string;
  onUpdate?: (updatedPost: PostData) => void;
}

export default function PostMoreButton({
  post,
  className,
  onUpdate,
}: PostMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMentionsDialog, setShowMentionsDialog] = useState(false);
  const [showTagsDialog, setShowTagsDialog] = useState(false);

  const mentions = useMemo(
    () => post.mentions?.map((m) => m.user) || [],
    [post.mentions]
  );

  const handleMentionsUpdate = useCallback(
    (newMentions: UserData[]) => {
      if (JSON.stringify(mentions) !== JSON.stringify(newMentions)) {
        const updatedPost: PostData = {
          ...post,
          mentions: newMentions.map((user) => ({
            id: `${post.id}-${user.id}`,
            postId: post.id,
            userId: user.id,
            user,
            createdAt: new Date(),
          })),
        };
        onUpdate?.(updatedPost);
        setShowMentionsDialog(false);
      }
    },
    [post, onUpdate, mentions]
  );

  const handleTagsUpdate = useCallback(
    (newTags: TagWithCount[]) => {
      if (JSON.stringify(post.tags) !== JSON.stringify(newTags)) {
        const updatedPost: PostData = {
          ...post,
          tags: newTags,
        };
        onUpdate?.(updatedPost);
        setShowTagsDialog(false);
      }
    },
    [post, onUpdate]
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={className}>
            <MoreHorizontal className="size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowMentionsDialog(true)}>
            <span className="flex items-center gap-3 text-foreground">
              <AtSign className="size-4" />
              Edit Mentions
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowTagsDialog(true)}>
            <span className="flex items-center gap-3 text-foreground">
              <Tags className="size-4" />
              Edit Tags
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <span className="flex items-center gap-3 text-destructive">
              <Trash2 className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showMentionsDialog} onOpenChange={setShowMentionsDialog}>
        <DialogContent>
          <DialogTitle>Edit Mentions</DialogTitle>
          <MentionTags
            // @ts-expect-error
            mentions={mentions}
            isOwner={true}
            postId={post.id}
            onMentionsChange={handleMentionsUpdate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showTagsDialog} onOpenChange={setShowTagsDialog}>
        <DialogContent>
          <DialogTitle>Edit Tags</DialogTitle>
          <TagsComponent
            tags={post.tags}
            isOwner={true}
            postId={post.id}
            onTagsChange={handleTagsUpdate}
          />
        </DialogContent>
      </Dialog>

      <DeletePostDialog
        post={post}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
