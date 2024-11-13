import { minioClient } from "@/lib/minio";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET;
const MINIO_BUCKET = process.env.MINIO_BUCKET_NAME || "uploads";

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

    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null,
        createdAt: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours old
        }
      },
      select: { id: true, key: true }
    });

    log(`Found ${unusedMedia.length} unused media files`);
    const validMedia = unusedMedia.filter((m) => m.key);

    if (validMedia.length > 0) {
      log(`Deleting ${validMedia.length} files from MinIO`);
      try {
        await Promise.all(
          validMedia.map((media) =>
            minioClient.send(
              new DeleteObjectCommand({
                Bucket: MINIO_BUCKET,
                Key: media.key
              })
            )
          )
        );
        log("✅ Successfully deleted files from MinIO");

        const result = await prisma.media.deleteMany({
          where: {
            id: {
              in: validMedia.map((m) => m.id)
            }
          }
        });

        log(`✅ Deleted ${result.count} records from database`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        log(`❌ Error during deletion: ${errorMessage}`);
        throw error;
      }
    } else {
      log("No valid media files to delete");
    }

    return NextResponse.json({
      success: true,
      deleted: validMedia.length,
      logs
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Cleanup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: errorMessage,
        logs
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
