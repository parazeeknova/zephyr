import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MediaViewerSkeletonProps {
  type?: "IMAGE" | "VIDEO" | "AUDIO" | "CODE" | "DOCUMENT";
  className?: string;
}

export function MediaViewerSkeleton({
  type = "IMAGE",
  className
}: MediaViewerSkeletonProps) {
  const renderSkeletonContent = () => {
    switch (type) {
      case "IMAGE":
      case "VIDEO":
        return (
          <div className="relative max-h-[85vh] min-h-[50vh] w-full max-w-4xl animate-pulse">
            <div className="h-full w-full animate-shimmer rounded-lg bg-[length:200%_100%] bg-gradient-to-r from-muted/50 via-muted to-muted/50" />
          </div>
        );

      case "AUDIO":
        return (
          <div className="flex animate-pulse flex-col items-center gap-4 rounded-lg bg-background/50 p-8">
            <div className="flex h-64 w-64 items-center justify-center rounded-full bg-muted/50">
              <div className="h-32 w-32 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="h-6 w-48 rounded-full bg-muted" />
            <div className="h-12 w-full max-w-md rounded-lg bg-muted" />
          </div>
        );

      case "CODE":
        return (
          <div className="w-full max-w-4xl animate-pulse rounded-lg bg-background/50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-48 rounded-full bg-muted" />
                <div className="h-4 w-24 rounded-full bg-muted/80" />
              </div>
              <div className="h-9 w-24 rounded-md bg-muted" />
            </div>
            <div className="space-y-2 rounded-lg bg-muted/30 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 w-full rounded bg-muted/50"
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              ))}
            </div>
          </div>
        );

      case "DOCUMENT":
        return (
          <div className="flex animate-pulse flex-col items-center gap-4 rounded-lg bg-background/50 p-8">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted/50">
              <div className="h-16 w-16 animate-pulse rounded-lg bg-muted" />
            </div>
            <div className="h-5 w-48 rounded-full bg-muted" />
            <div className="h-4 w-32 rounded-full bg-muted/80" />
            <div className="flex gap-4">
              <div className="h-9 w-24 rounded-md bg-muted" />
              <div className="h-9 w-24 rounded-md bg-muted/80" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open>
      <DialogContent
        className={cn(
          "max-h-[95vh] max-w-[95vw] border-none bg-transparent p-0",
          className
        )}
      >
        <div className="relative flex h-full min-h-[50vh] w-full items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />

          <div className="absolute top-2 right-2 z-50 h-9 w-9 animate-pulse rounded-md bg-muted/50" />
          <div className="-translate-y-1/2 absolute top-1/2 left-2 z-50 h-9 w-9 animate-pulse rounded-md bg-muted/50" />
          <div className="-translate-y-1/2 absolute top-1/2 right-2 z-50 h-9 w-9 animate-pulse rounded-md bg-muted/50" />

          <div className="-translate-x-1/2 absolute bottom-4 left-1/2 z-50 h-6 w-16 animate-pulse rounded-full bg-muted/50" />

          <div className="relative flex h-full w-full items-center justify-center p-4">
            {renderSkeletonContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
