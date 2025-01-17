import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useUpdateMentionsMutation } from "@/posts/editor/mutations";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import type { UserData } from "@zephyr/db";
import { AnimatePresence, motion } from "framer-motion";
import { AtSign } from "lucide-react";
import { useState } from "react";
import { MentionTagEditor } from "./MentionTagEditor";

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const tagVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.05 },
  exit: { opacity: 0, scale: 0.9 }
};

const baseTagClass =
  "flex h-7 items-center gap-1.5 rounded-full border px-3 py-1";

interface MentionTagsProps {
  mentions: UserData[];
  isOwner: boolean;
  className?: string;
  postId?: string;
  onMentionsChange?: (mentions: UserData[]) => void;
}

export function MentionTags({
  mentions,
  isOwner,
  className,
  postId,
  onMentionsChange
}: MentionTagsProps) {
  const [isEditing, setIsEditing] = useState(false);

  // biome-ignore lint/correctness/noUnusedVariables: ignore
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const updateMentions = useUpdateMentionsMutation(postId);

  const handleMentionsUpdate = async (newMentions: UserData[]) => {
    try {
      if (postId) {
        await updateMentions.mutateAsync(newMentions.map((m) => m.id));
      }
      onMentionsChange?.(newMentions);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update mentions:", error);
    }
  };

  return (
    <>
      {mentions.length > 0 || isOwner ? (
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-sm">
            People mentioned in this post:
          </h3>
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className={cn("flex flex-wrap gap-2", className)}
          >
            <AnimatePresence mode="sync">
              {mentions.map((user) => (
                <motion.div
                  key={user.id}
                  variants={tagVariants}
                  layout
                  whileHover="hover"
                  onHoverStart={() => setHoveredTag(user.id)}
                  onHoverEnd={() => setHoveredTag(null)}
                  className="group relative"
                >
                  <div
                    className={cn(
                      baseTagClass,
                      "bg-blue-500/5 text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/10"
                    )}
                  >
                    <UserAvatar user={user} size={20} />
                    <span className="font-medium">@{user.username}</span>
                  </div>
                </motion.div>
              ))}

              {isOwner && (
                <motion.div
                  variants={tagVariants}
                  layout
                  whileHover="hover"
                  className="relative"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className={cn(
                      baseTagClass,
                      "bg-muted/50 hover:border-blue-500/30 hover:bg-muted/80",
                      "font-normal"
                    )}
                  >
                    <AtSign className="mr-1 h-3.5 w-3.5" />
                    <span className="text-sm">Mention someone</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : null}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <MentionTagEditor
            initialMentions={mentions}
            onClose={() => setIsEditing(false)}
            onMentionsUpdate={handleMentionsUpdate}
            postId={postId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
