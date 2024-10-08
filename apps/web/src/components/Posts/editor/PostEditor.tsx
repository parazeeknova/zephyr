"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { useSession } from "@/app/(main)/SessionProvider";
import { useSubmitPostMutation } from "@/posts/editor/mutations";
import LoadingButton from "@zephyr-ui/Auth/LoadingButton";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import "./styles.css";

export default function PostEditor() {
  const { user } = useSession();
  const mutation = useSubmitPostMutation();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false
      }),
      Placeholder.configure({
        placeholder: "What's crack-a-lackin'?"
      })
    ]
  });

  const input =
    editor?.getText({
      blockSeparator: "\n"
    }) || "";

  function onSubmit() {
    mutation.mutate(input, {
      onSuccess: () => {
        editor?.commands.clearContent();
      }
    });
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-md">
      <div className="flex items-center gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <EditorContent
          editor={editor}
          className="editor-content max-h-[20rem] w-full flex-grow overflow-y-auto rounded-2xl bg-[hsl(var(--background-alt))] px-5 py-5"
        />
      </div>
      <div className="flex justify-end">
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!input.trim()}
          className="min-w-20"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}
