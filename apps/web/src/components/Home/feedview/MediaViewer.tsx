"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Media } from "@prisma/client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface MediaViewerProps {
  media: Media[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

const MediaViewer = ({
  media,
  initialIndex = 0,
  isOpen,
  onClose
}: MediaViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const currentMedia = media[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] max-w-[95vw] border-none bg-transparent p-0">
        <DialogTitle className="sr-only">
          Media Viewer - {currentIndex + 1} of {media.length}
        </DialogTitle>

        <div className="relative flex h-full min-h-[50vh] w-full items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-50 bg-background/50 hover:bg-background/80"
            onClick={onClose}
            aria-label="Close viewer"
          >
            <X className="h-4 w-4" />
          </Button>

          {media.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="-translate-y-1/2 absolute top-1/2 left-2 z-50 bg-background/50 hover:bg-background/80"
                onClick={handlePrevious}
                aria-label="Previous media"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="-translate-y-1/2 absolute top-1/2 right-2 z-50 bg-background/50 hover:bg-background/80"
                onClick={handleNext}
                aria-label="Next media"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="-translate-x-1/2 absolute bottom-4 left-1/2 z-50 rounded-full bg-background/50 px-3 py-1">
                <span className="text-sm">
                  {currentIndex + 1} / {media.length}
                </span>
              </div>
            </>
          )}

          <div className="relative flex h-full w-full items-center justify-center p-4">
            {currentMedia.type === "IMAGE" ? (
              <div className="relative max-h-full max-w-full">
                <Image
                  src={currentMedia.url}
                  alt={`Media item ${currentIndex + 1}`}
                  width={1200}
                  height={800}
                  className="max-h-[85vh] object-contain"
                  quality={100}
                  priority
                  sizes="95vw"
                />
              </div>
            ) : currentMedia.type === "VIDEO" ? (
              <div className="relative max-h-full max-w-full">
                <video
                  src={currentMedia.url}
                  controls
                  className={cn(
                    "max-h-[85vh] w-auto",
                    "shadow-lg transition-transform duration-200"
                  )}
                  autoPlay
                  playsInline
                  aria-label={`Video ${currentIndex + 1} of ${media.length}`}
                />
              </div>
            ) : (
              <p className="text-destructive">Unsupported media type</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaViewer;
