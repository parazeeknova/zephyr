import { MentionTags } from "@/components/Tags/MentionTags";
import { Tags as TagsComponent } from "@/components/Tags/Tags";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { PostData } from "@zephyr/db";
import { AtSign, MoreHorizontal, Tags, Trash2 } from "lucide-react";
import { useState } from "react";
import DeletePostDialog from "./DeletePostDialog";

interface PostMoreButtonProps {
  post: PostData;
  className?: string;
}

export default function PostMoreButton({
  post,
  className
}: PostMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMentionsDialog, setShowMentionsDialog] = useState(false);
  const [showTagsDialog, setShowTagsDialog] = useState(false);

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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AtSign className="size-4" />
              Edit Mentions
            </DialogTitle>
          </DialogHeader>
          <MentionTags
            // @ts-expect-error
            mentions={post.mentions.map((m) => m.user)}
            isOwner={true}
            postId={post.id}
            onClose={() => setShowMentionsDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showTagsDialog} onOpenChange={setShowTagsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tags className="size-4" />
              Edit Tags
            </DialogTitle>
          </DialogHeader>
          <TagsComponent
            tags={post.tags}
            isOwner={true}
            postId={post.id}
            // @ts-expect-error
            onClose={() => setShowTagsDialog(false)}
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
