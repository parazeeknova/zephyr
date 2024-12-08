import { deleteAvatar } from "@/lib/minio";
import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: Request) {
  const logs: string[] = [];
  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  try {
    const authHeader = req.headers.get("Authorization");

    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    log("🔍 Finding unused media files...");
    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null,
        ...(process.env.NODE_ENV === "production"
          ? {
              createdAt: {
                lte: new Date(Date.now() - 1000 * 60 * 60 * 24)
              }
            }
          : {})
      },
      select: { id: true, key: true }
    });

    log(`Found ${unusedMedia.length} unused media files`);

    if (unusedMedia.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No unused media files to clean up",
        deleted: 0,
        logs
      });
    }

    // @ts-ignore
    const deletePromises = unusedMedia.map(async (media) => {
      if (media.key) {
        try {
          await deleteAvatar(media.key);
          log(`✅ Successfully deleted file: ${media.key}`);
        } catch (error) {
          log(
            `❌ Error deleting file ${media.key}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    });

    await Promise.all(deletePromises);

    const deleteResult = await prisma.media.deleteMany({
      // @ts-ignore
      where: { id: { in: unusedMedia.map((m) => m.id) } }
    });

    log("🔍 Finding orphaned user avatars...");
    const orphanedAvatars = await prisma.user.findMany({
      where: {
        avatarKey: {
          not: null
        },
        AND: {
          avatarUrl: null
        }
      },
      select: {
        id: true,
        avatarKey: true
      }
    });

    if (orphanedAvatars.length > 0) {
      log(`Found ${orphanedAvatars.length} orphaned avatars`);

      // @ts-ignore
      const avatarDeletePromises = orphanedAvatars.map(async (user) => {
        if (user.avatarKey) {
          try {
            await deleteAvatar(user.avatarKey);
            await prisma.user.update({
              where: { id: user.id },
              data: { avatarKey: null }
            });
            log(`✅ Successfully deleted orphaned avatar: ${user.avatarKey}`);
          } catch (error) {
            log(
              `❌ Error deleting orphaned avatar ${user.avatarKey}: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
      });

      await Promise.all(avatarDeletePromises);
    }

    return NextResponse.json({
      success: true,
      deleted: deleteResult.count,
      filesProcessed: unusedMedia.length,
      orphanedAvatarsProcessed: orphanedAvatars.length,
      logs
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", logs },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
