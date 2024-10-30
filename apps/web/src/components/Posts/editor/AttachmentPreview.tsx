import { getLanguageFromFileName } from "@/lib/codefileExtensions";
import { formatFileName } from "@/lib/formatFileName";
import { cn } from "@/lib/utils";
import { FileAudioIcon, FileCode, FileIcon, X } from "lucide-react";
import Image from "next/image";
import type { Attachment } from "./useMediaUpload";

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

export function AttachmentPreview({
  attachment: { file, isUploading },
  onRemoveClick
}: AttachmentPreviewProps) {
  const src = URL.createObjectURL(file);
  const fileName = file.name;

  const renderPreview = () => {
    if (file.type.startsWith("image")) {
      return (
        <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl bg-primary/5">
          <Image
            src={src}
            alt={fileName}
            width={500}
            height={500}
            className="h-full w-full object-cover"
          />
        </div>
      );
    }

    if (
      file.type.startsWith("text/") ||
      file.type === "application/json" ||
      file.type === "application/xml"
    ) {
      const language = getLanguageFromFileName(fileName);
      return (
        <div className="w-full rounded-2xl bg-primary/5 p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center">
              <FileCode className="h-full w-full text-primary" />
            </div>
            <div className="w-full max-w-[250px] space-y-1">
              <p className="truncate text-center font-medium text-sm">
                {formatFileName(fileName)}
              </p>
              <p className="text-center text-muted-foreground text-xs">
                {language}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (file.type.startsWith("video")) {
      return (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-primary/5">
          <video controls className="h-full w-full object-cover">
            <source src={src} type={file.type} />
          </video>
        </div>
      );
    }

    if (file.type.startsWith("audio")) {
      return (
        <div className="w-full rounded-2xl bg-primary/5 p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center">
              <FileAudioIcon className="h-full w-full text-primary" />
            </div>
            <div className="w-full max-w-[250px] px-2">
              <p className="truncate text-center font-medium text-sm">
                {formatFileName(fileName)}
              </p>
            </div>
            <audio controls className="w-full max-w-md">
              <source src={src} type={file.type} />
            </audio>
          </div>
        </div>
      );
    }

    // Document or other file types
    return (
      <div className="w-full rounded-2xl bg-primary/5 p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center">
            <FileIcon className="h-full w-full text-primary" />
          </div>
          <div className="w-full max-w-[250px] space-y-1">
            <p className="truncate text-center font-medium text-sm">
              {formatFileName(fileName)}
            </p>
            <p className="text-center text-muted-foreground text-xs">
              {file.type || "Document"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative w-full", isUploading && "opacity-50")}>
      {renderPreview()}
      {!isUploading && (
        <button
          type="button"
          onClick={onRemoveClick}
          className="absolute top-3 right-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
