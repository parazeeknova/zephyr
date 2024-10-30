import { formatFileName } from "@/lib/formatFileName";
import { cn } from "@/lib/utils";
import { FileAudioIcon, FileIcon, X } from "lucide-react";
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
        <Image
          src={src}
          alt={fileName}
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-2xl"
        />
      );
    }

    if (file.type.startsWith("video")) {
      return (
        <video controls className="size-fit max-h-[30rem] rounded-2xl">
          <source src={src} type={file.type} />
        </video>
      );
    }

    if (file.type.startsWith("audio")) {
      return (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary/5 p-8">
          <FileAudioIcon className="h-16 w-16 text-primary" />
          <p className="max-w-full truncate font-medium text-sm">
            {formatFileName(fileName)}
          </p>
          <audio controls className="w-full max-w-md">
            <source src={src} type={file.type} />
          </audio>
        </div>
      );
    }

    // Document or other file types
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary/5 p-8">
        <FileIcon className="h-16 w-16 text-primary" />
        <div className="flex flex-col items-center gap-1">
          <p className="max-w-full truncate font-medium text-sm">
            {formatFileName(fileName)}
          </p>
          <p className="text-muted-foreground text-xs">
            {file.type || "Document"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}
    >
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
