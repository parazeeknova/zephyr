import { getLanguageFromFileName } from '@/lib/codefileExtensions';
import { formatFileName } from '@/lib/formatFileName';
import { cn } from '@/lib/utils';
import { FileAudioIcon, FileCode, FileIcon, X } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

interface AttachmentPreviewProps {
  attachment: {
    file: File;
    isUploading: boolean;
    previewUrl?: string;
  };
  onRemoveClick: () => void;
}

export const AttachmentPreview = memo(function AttachmentPreview({
  attachment: { file, isUploading, previewUrl: existingPreviewUrl },
  onRemoveClick,
}: AttachmentPreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string>(existingPreviewUrl || '');
  const fileName = file.name;

  useEffect(() => {
    if (!existingPreviewUrl) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, existingPreviewUrl]);

  const renderPreview = () => {
    if (!objectUrl) {
      return null;
    }

    if (file.type.startsWith('image')) {
      return (
        <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl bg-primary/5">
          <Image
            src={objectUrl}
            alt={fileName}
            className="h-full w-full rounded-2xl object-cover"
            layout="fill"
            objectFit="cover"
          />
        </div>
      );
    }

    if (
      file.type.startsWith('text/') ||
      file.type === 'application/json' ||
      file.type === 'application/xml'
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

    if (file.type.startsWith('video')) {
      return (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-primary/5">
          {/* biome-ignore lint/a11y/useMediaCaption: ignore */}
          <video
            controls
            className="h-full w-full object-cover"
            preload="metadata"
          >
            <source src={objectUrl} type={file.type} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (file.type.startsWith('audio')) {
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
            {/* biome-ignore lint/a11y/useMediaCaption: ignore */}
            <audio controls className="w-full max-w-md" preload="metadata">
              <source src={objectUrl} type={file.type} />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      );
    }

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
              {file.type || 'Document'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'relative w-full transition-opacity duration-200',
        isUploading && 'opacity-50'
      )}
    >
      {renderPreview()}
      {!isUploading && (
        <button
          type="button"
          onClick={onRemoveClick}
          className="absolute top-3 right-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Remove attachment"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
});
