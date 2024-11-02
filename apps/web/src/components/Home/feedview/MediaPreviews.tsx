import { getLanguageFromFileName } from "@/lib/codefileExtensions";
import { formatFileName } from "@/lib/formatFileName";
import { cn } from "@/lib/utils";
import type { Media } from "@prisma/client";
import { FileAudioIcon, FileCode, FileIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import MediaViewer from "./MediaViewer";

interface MediaPreviewsProps {
  attachments: Media[];
}

export function MediaPreviews({ attachments }: MediaPreviewsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const getMediaUrl = (mediaId: string) => `/api/media/${mediaId}`;

  const renderPreview = (m: Media, _index: number) => {
    const commonClasses =
      "mx-auto h-full max-h-[20rem] w-[85%] rounded-lg object-cover sm:max-h-[30rem] sm:rounded-2xl";

    switch (m.type) {
      case "IMAGE":
        return (
          <>
            <Image
              src={getMediaUrl(m.id)}
              alt="Attachment"
              width={500}
              height={500}
              className={commonClasses}
            />
            <div className="absolute inset-0 bg-black/5 transition-opacity hover:opacity-0" />
          </>
        );
      case "VIDEO":
        return (
          <>
            <video
              src={getMediaUrl(m.id)}
              className={commonClasses}
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/5 transition-opacity hover:opacity-0" />
          </>
        );
      case "AUDIO":
        return (
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg bg-primary/5 p-4">
            <FileAudioIcon className="h-12 w-12 text-primary" />
            <p className="max-w-full truncate font-medium text-sm">
              {formatFileName(m.key)}
            </p>
          </div>
        );
      case "CODE":
        return (
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg bg-primary/5 p-4">
            <FileCode className="h-12 w-12 text-primary" />
            <div className="flex flex-col items-center">
              <p className="max-w-full truncate font-medium text-sm">
                {formatFileName(m.key)}
              </p>
              <p className="text-muted-foreground text-xs">
                {getLanguageFromFileName(m.key)}
              </p>
            </div>
          </div>
        );
      case "DOCUMENT":
        return (
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg bg-primary/5 p-4">
            <FileIcon className="h-12 w-12 text-primary" />
            <p className="max-w-full truncate font-medium text-sm">
              {formatFileName(m.key)}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex w-full flex-col gap-2 sm:gap-3",
          attachments.length > 1 && "sm:grid sm:grid-cols-2"
        )}
      >
        {attachments.map((m, index) => (
          <div
            key={m.id}
            onClick={() => setSelectedIndex(index)}
            className="relative cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
          >
            {renderPreview(m, index)}
          </div>
        ))}
      </div>
      {selectedIndex !== null && (
        <MediaViewer
          media={attachments}
          initialIndex={selectedIndex}
          isOpen={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}
