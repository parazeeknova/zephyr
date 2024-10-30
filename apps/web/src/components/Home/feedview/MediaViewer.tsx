"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getLanguageFromFileName } from "@/lib/codefileExtensions";
import { formatFileName } from "@/lib/formatFileName";
import { cn } from "@/lib/utils";
import type { Media } from "@prisma/client";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileCode,
  FileIcon,
  X
} from "lucide-react";
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
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const response = await fetch(`/api/media/download/${currentMedia.id}`);

      if (response.status === 429) {
        const data = await response.json();
        toast({
          title: "Download Rate Limited",
          description: data.message,
          variant: "destructive"
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = formatFileName(currentMedia.key);
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description:
          "There was an error downloading the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const DownloadButton = () => (
    <Button
      onClick={handleDownload}
      className="flex items-center gap-2"
      variant="secondary"
      disabled={isDownloading}
    >
      {isDownloading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download {formatFileName(currentMedia.key)}
        </>
      )}
    </Button>
  );

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

  const renderMedia = () => {
    switch (currentMedia.type) {
      case "IMAGE":
        return (
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
        );

      case "VIDEO":
        return (
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
        );

      case "AUDIO":
        return (
          <div className="flex flex-col items-center gap-4 rounded-lg bg-background/50 p-8">
            <div className="flex h-64 w-64 items-center justify-center rounded-full bg-primary/10">
              <FileIcon className="h-32 w-32 text-primary" />
            </div>
            <p className="font-medium text-lg">
              {formatFileName(currentMedia.key)}
            </p>
            <audio
              src={currentMedia.url}
              controls
              className="w-full max-w-md"
              autoPlay
              aria-label={`Audio ${currentIndex + 1} of ${media.length}`}
            />
          </div>
        );

      case "CODE":
        return (
          <div className="flex flex-col items-center gap-4 rounded-lg bg-background/50 p-8">
            <div className="flex h-64 w-64 items-center justify-center rounded-full bg-primary/10">
              <FileCode className="h-32 w-32 text-primary" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="font-medium text-lg">
                {formatFileName(currentMedia.key)}
              </p>
              <p className="text-muted-foreground text-sm">
                {getLanguageFromFileName(currentMedia.key)}
              </p>
            </div>
            <DownloadButton />
          </div>
        );

      case "DOCUMENT":
        return (
          <div className="flex flex-col items-center gap-4 rounded-lg bg-background/50 p-8">
            <div className="flex h-64 w-64 items-center justify-center rounded-full bg-primary/10">
              <FileIcon className="h-32 w-32 text-primary" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="font-medium text-lg">
                {formatFileName(currentMedia.key)}
              </p>
              <p className="text-muted-foreground text-sm">
                {currentMedia.mimeType || "Document"}
              </p>
            </div>
            <DownloadButton />
          </div>
        );

      default:
        return <p className="text-destructive">Unsupported media type</p>;
    }
  };

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
            {renderMedia()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaViewer;
