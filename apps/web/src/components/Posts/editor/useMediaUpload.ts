import { useToast } from "@/hooks/use-toast";
import { validateFile } from "@/lib/minio";
import { useState } from "react";

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

export default function useMediaUpload() {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>();

  async function uploadMedia(file: File) {
    try {
      validateFile(file);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { mediaId, url } = await response.json();
      return { mediaId, url };
    } catch (error: any) {
      throw new Error(error.message || "Upload failed");
    }
  }

  async function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast({
        variant: "destructive",
        description: "Please wait for the current upload to finish."
      });
      return;
    }

    if (attachments.length + files.length > 5) {
      toast({
        variant: "destructive",
        description: "You can only upload up to 5 attachments per post."
      });
      return;
    }

    setIsUploading(true);
    setAttachments((prev) => [
      ...prev,
      ...files.map((file) => ({ file, isUploading: true }))
    ]);

    try {
      let completed = 0;
      await Promise.all(
        files.map(async (file) => {
          try {
            const result = await uploadMedia(file);
            setAttachments((prev) =>
              prev.map((a) =>
                a.file === file
                  ? { ...a, mediaId: result.mediaId, isUploading: false }
                  : a
              )
            );
            completed++;
            setUploadProgress((completed / files.length) * 100);
          } catch (error: any) {
            toast({
              variant: "destructive",
              description: error.message
            });
            setAttachments((prev) => prev.filter((a) => a.file !== file));
          }
        })
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(undefined);
    }
  }

  function removeAttachment(fileName: string) {
    setAttachments((prev) => prev.filter((a) => a.file.name !== fileName));
  }

  function reset() {
    setAttachments([]);
    setUploadProgress(undefined);
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset
  };
}
