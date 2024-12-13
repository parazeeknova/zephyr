"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { cn } from "@/lib/utils";
import { useSubmitPostMutation } from "@/posts/editor/mutations";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LoadingButton from "@zephyr-ui/Auth/LoadingButton";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { ClipboardEvent } from "react";
import { useDropzone } from "react-dropzone";
import { AttachmentPreview } from "./AttachmentPreview";
import { FileInput } from "./FileInput";
import "./styles.css";
import useMediaUpload, { type Attachment } from "./useMediaUpload";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function PostEditor() {
  const { user } = useSession();
  const mutation = useSubmitPostMutation();

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles: any[]) => {
      const validFiles = acceptedFiles.filter(
        (file: { type: string }) =>
          file.type.startsWith("image/") || file.type.startsWith("video/")
      );
      if (validFiles.length) {
        await startUpload(validFiles);
      }
    },
    accept: {
      "image/*": [],
      "video/*": []
    },
    maxSize: 128 * 1024 * 1024
  });

  const { onClick, ...rootProps } = getRootProps();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false
      }),
      Placeholder.configure({
        placeholder: "What's crack-a-lackin'?"
      })
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none"
      }
    },
    immediatelyRender: false
  });

  const input = editor?.getText({ blockSeparator: "\n" }) || "";

  function onSubmit() {
    mutation.mutate(
      {
        content: input,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[]
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          resetMediaUploads();
        }
      }
    );
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];
    startUpload(files);
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 transition-shadow duration-300 hover:shadow-lg"
    >
      <motion.div variants={itemVariants} className="flex gap-5">
        <div className="hidden sm:inline">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <UserAvatar avatarUrl={user.avatarUrl} />
          </motion.div>
        </div>
        <div {...rootProps} className="w-full">
          <motion.div
            variants={itemVariants}
            className={cn(
              "relative rounded-2xl transition-all duration-300",
              isDragActive && "ring-2 ring-primary ring-offset-2"
            )}
          >
            <EditorContent
              editor={editor}
              className={cn(
                "max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-[hsl(var(--background-alt))] px-5 py-3 text-foreground",
                "transition-all duration-300 ease-in-out",
                "focus-within:ring-2 focus-within:ring-primary",
                isDragActive && "outline-dashed outline-primary"
              )}
              onPaste={onPaste}
            />
            {isDragActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/10 backdrop-blur-sm"
              >
                <p className="font-medium text-lg text-primary">
                  Drop files here
                </p>
              </motion.div>
            )}
          </motion.div>
          <input {...getInputProps()} />
        </div>
      </motion.div>

      <AnimatePresence>
        {!!attachments.length && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AttachmentPreviews
              attachments={attachments}
              removeAttachment={removeAttachment}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="flex items-center justify-end gap-3"
      >
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2"
            >
              <span className="font-medium text-sm tabular-nums">
                {(uploadProgress ?? 0).toFixed(1)}%
              </span>
              <Loader2 className="size-5 animate-spin text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <FileInput
            onFilesSelected={startUpload}
            disabled={isUploading || attachments.length >= 5}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <LoadingButton
            onClick={onSubmit}
            loading={mutation.isPending}
            disabled={!input.trim() || isUploading}
            className="min-w-20 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Post
          </LoadingButton>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews({
  attachments,
  removeAttachment
}: AttachmentPreviewsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachments.map((attachment, index) => (
        <motion.div
          key={attachment.file.name}
          variants={itemVariants}
          custom={index}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <AttachmentPreview
            attachment={attachment}
            onRemoveClick={() => removeAttachment(attachment.file.name)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
