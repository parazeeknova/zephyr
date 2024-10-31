import { getStreamClient } from "@/lib/stream";
import { validateRequest } from "@zephyr/auth/auth";
import { prisma } from "@zephyr/db";
import { type FileRouter, createUploadthing } from "uploadthing/next";
import { UTApi, UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const fileRouter = {
  avatar: f({
    image: { maxFileSize: "8MB" },
    "image/gif": { maxFileSize: "8MB" }
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.user.avatarUrl;

      if (
        oldAvatarUrl?.includes(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}`
        )
      ) {
        try {
          const key = oldAvatarUrl.split(
            `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
          )[1];
          await new UTApi().deleteFiles(key);
        } catch (error) {
          console.error("Failed to delete old avatar:", error);
        }
      }

      const newAvatarUrl = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
      );

      const streamClient = getStreamClient();

      await Promise.all([
        prisma.user.update({
          where: { id: metadata.user.id },
          data: {
            avatarUrl: newAvatarUrl
          }
        }),
        streamClient.partialUpdateUser({
          id: metadata.user.id,
          set: {
            image: newAvatarUrl
          }
        })
      ]);

      return { avatarUrl: newAvatarUrl };
    }),
  attachment: f({
    image: { maxFileSize: "16MB", maxFileCount: 5 },
    video: { maxFileSize: "128MB", maxFileCount: 5 }
  })
    .middleware(async () => {
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");

      return {};
    })
    .onUploadComplete(async ({ file }) => {
      const media = await prisma.media.create({
        data: {
          url: file.url.replace(
            "/f/",
            `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
          ),
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO"
        }
      });

      return { mediaId: media.id };
    })
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
