import type React from 'react';

interface CommentSkeletonProps {
  showActions?: boolean;
}

const CommentSkeleton: React.FC<CommentSkeletonProps> = ({
  showActions = true,
}) => {
  return (
    <div className="group/comment flex gap-3 py-3">
      <div className="hidden sm:block">
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
      {showActions && (
        <div className="ms-auto">
          <div className="h-8 w-8 animate-pulse rounded-md bg-muted opacity-0 transition-opacity group-hover/comment:opacity-100" />
        </div>
      )}
    </div>
  );
};

export default CommentSkeleton;
