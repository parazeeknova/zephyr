"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { AttachmentPreview } from "@/components/Posts/editor/AttachmentPreview";
import { FileInput } from "@/components/Posts/editor/FileInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSubmitPostMutation } from "@/posts/editor/mutations";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, PenLine, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ClipboardEvent, useState } from "react";

interface CreatePostCardProps {
  isCollapsed: boolean;
}

type UploadState = {
  file: File;
  isUploading: boolean;
  mediaId?: string;
};

export default function CreatePostCard({ isCollapsed }: CreatePostCardProps) {
  const router = useRouter();
  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  const { user } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [attachments, setAttachments] = useState<UploadState[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const mutation = useSubmitPostMutation();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false
      }),
      Placeholder.configure({
        placeholder: "What's on your mind?"
      })
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[100px]"
      }
    }
  });

  const handleFileUpload = async (files: File[]) => {
    if (attachments.length + files.length > 4) {
      // Add toast notification here
      console.error("Maximum 4 files allowed");
      return;
    }

    setIsUploading(true);
    const newAttachments: UploadState[] = files.map((file) => ({
      file,
      isUploading: true
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        if (file) {
          formData.append("file", file);
        }

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();

        setAttachments((prev) =>
          prev.map((att) =>
            file && att.file.name === file.name
              ? { ...att, isUploading: false, mediaId: data.mediaId }
              : att
          )
        );

        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setAttachments((prev) =>
        prev.filter((a) => !files.find((f) => f.name === a.file.name))
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeAttachment = (fileName: string) => {
    setAttachments((prev) => prev.filter((a) => a.file.name !== fileName));
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];
    if (files.length) handleFileUpload(files);
  };

  const onSubmit = async () => {
    const content = editor?.getText() || "";
    if (!content.trim() && attachments.length === 0) return;

    const mediaIds = attachments
      .filter((a) => a.mediaId)
      .map((a) => a.mediaId as string);

    mutation.mutate(
      { content, mediaIds },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          setAttachments([]);
          setIsExpanded(false);
        }
      }
    );
  };

  if (isCollapsed) {
    return (
      <motion.div
        initial={false}
        animate={{ width: "3rem" }}
        // @ts-expect-error
        className="sticky"
        style={{ top: "80px" }}
      >
        <Card className="w-12 bg-card p-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/compose")}
              className="w-full"
              title="Create Post"
            >
              <PenLine className="h-5 w-5 text-muted-foreground" />
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="w-full bg-card transition-all duration-300">
      <div className="p-4">
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // @ts-expect-error
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Create Post</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Editor */}
            <div
              className={cn(
                "rounded-lg bg-background p-4",
                "focus-within:ring-2 focus-within:ring-primary"
              )}
              onPaste={handlePaste}
            >
              <EditorContent editor={editor} />
            </div>

            {/* Attachments */}
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  // @ts-expect-error
                  className="space-y-2"
                >
                  {attachments.map((attachment) => (
                    <AttachmentPreview
                      key={attachment.file.name}
                      attachment={attachment}
                      onRemoveClick={() =>
                        removeAttachment(attachment.file.name)
                      }
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <FileInput
                onFilesSelected={handleFileUpload}
                disabled={isUploading || attachments.length >= 4}
              />

              <div className="flex items-center gap-2">
                {isUploading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{uploadProgress.toFixed(0)}%</span>
                  </div>
                )}
                <Button
                  onClick={onSubmit}
                  disabled={
                    mutation.isPending ||
                    isUploading ||
                    (!editor?.getText().trim() && attachments.length === 0)
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Post"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setIsExpanded(true)}
              className="w-full justify-start"
            >
              <PenLine className="mr-4 h-5 w-5 text-muted-foreground" />
              <span>Create Post</span>
            </Button>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
