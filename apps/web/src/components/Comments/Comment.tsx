import { useSession } from "@/app/(main)/SessionProvider";
import Linkify from "@/helpers/global/Linkify";
import { formatRelativeDate } from "@/lib/utils";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import UserTooltip from "@zephyr-ui/Layouts/UserTooltip";
import type { CommentData } from "@zephyr/db";
import Link from "next/link";
import CommentMoreButton from "./CommentMoreButton";

interface CommentProps {
  comment: CommentData;
}

export default function Comment({ comment }: CommentProps) {
  const { user } = useSession();

  return (
    <div className="group/comment flex gap-3 py-3">
      <span className="hidden sm:inline">
        <UserTooltip user={comment.user}>
          <Link href={`/users/${comment.user.username}`}>
            <UserAvatar avatarUrl={comment.user.avatarUrl} size={40} />
          </Link>
        </UserTooltip>
      </span>
      <div>
        <div className="flex items-center gap-1 text-sm">
          <UserTooltip user={comment.user}>
            <Link
              href={`/users/${comment.user.username}`}
              className="font-medium hover:underline"
            >
              {comment.user.displayName}
            </Link>
          </UserTooltip>
          <span className="text-muted-foreground">
            {formatRelativeDate(comment.createdAt)}
          </span>
        </div>
        <UserTooltip user={comment.user}>
          <Linkify>{comment.content}</Linkify>
        </UserTooltip>
      </div>
      {comment.user.id === user.id && (
        <CommentMoreButton
          comment={comment}
          className="ms-auto opacity-0 transition-opacity group-hover/comment:opacity-100"
        />
      )}
    </div>
  );
}
