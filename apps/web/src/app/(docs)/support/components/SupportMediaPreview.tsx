import { MediaPreviews } from '@/components/Home/feedview/MediaPreviews';
import { AttachmentPreview } from '@/components/Posts/editor/AttachmentPreview';
import type { Media } from '@prisma/client'; // Create this type
import type { Attachment } from '../types';

interface SupportMediaPreviewProps {
  attachments: Attachment[];
  onRemove: (index: number) => void;
  uploadedMedia?: Media[];
}

export function SupportMediaPreview({
  attachments,
  onRemove,
  uploadedMedia,
}: SupportMediaPreviewProps) {
  return (
    <div className="space-y-4">
      {attachments.map((attachment, index) => (
        <AttachmentPreview
          key={index}
          attachment={{
            file: attachment.file,
            isUploading: false,
          }}
          onRemoveClick={() => {
            if (attachment.previewUrl) {
              URL.revokeObjectURL(attachment.previewUrl);
            }
            onRemove(index);
          }}
        />
      ))}
      {uploadedMedia && uploadedMedia.length > 0 && (
        <MediaPreviews attachments={uploadedMedia} />
      )}
    </div>
  );
}
