import { minioClient } from "@/lib/minio";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

const MINIO_BUCKET = process.env.MINIO_BUCKET_NAME || "uploads";

async function cleanupUnusedMedia() {
  const logs: string[] = [];
  const startTime = Date.now();

  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  const results = {
    foundFiles: 0,
    deletedFromMinio: 0,
    deletedFromDb: 0,
    errors: [] as string[]
  };

  try {
    log("🚀 Starting media cleanup process");

    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null,
        createdAt: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours old
        }
      },
      select: {
        id: true,
        key: true,
        type: true,
        mimeType: true,
        size: true,
        createdAt: true
      }
    });

    results.foundFiles = unusedMedia.length;
    log(`🔍 Found ${unusedMedia.length} unused media files`);

    const validMedia = unusedMedia.filter((m) => m.key);
    log(`📊 ${validMedia.length} files have valid storage keys`);

    if (validMedia.length > 0) {
      // Log details of files to be deleted
      // biome-ignore lint/complexity/noForEach: This is a logging loop
      validMedia.forEach((file) => {
        log(`📝 Queued for deletion: ${file.key}
        Type: ${file.type}
        MIME: ${file.mimeType}
        Size: ${(file.size / 1024 / 1024).toFixed(2)}MB
        Age: ${Math.floor((Date.now() - file.createdAt.getTime()) / (1000 * 60 * 60))} hours`);
      });

      const batchSize = 50;
      for (let i = 0; i < validMedia.length; i += batchSize) {
        const batch = validMedia.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(validMedia.length / batchSize);

        log(
          `\n🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} files)`
        );

        try {
          const minioResults = await Promise.allSettled(
            batch.map((media) =>
              minioClient.send(
                new DeleteObjectCommand({
                  Bucket: MINIO_BUCKET,
                  Key: media.key
                })
              )
            )
          );

          minioResults.forEach((result, index) => {
            if (result.status === "fulfilled") {
              results.deletedFromMinio++;
              if (batch[index]) {
                log(`✅ Deleted from storage: ${batch[index].key}`);
              }
            } else {
              const errorMessage = `Failed to delete from storage: ${batch[index]?.key ?? "unknown"} - ${result.reason}`;
              log(`❌ ${errorMessage}`);
              results.errors.push(errorMessage);
            }
          });

          const dbResult = await prisma.media.deleteMany({
            where: {
              id: {
                in: batch.map((m) => m.id)
              }
            }
          });

          results.deletedFromDb += dbResult.count;
          log(`✅ Deleted ${dbResult.count} records from database`);

          if (i + batchSize < validMedia.length) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        } catch (error) {
          const errorMessage = `Error processing batch ${batchNumber}: ${
            error instanceof Error ? error.message : String(error)
          }`;
          log(`❌ ${errorMessage}`);
          results.errors.push(errorMessage);
        }
      }
    } else {
      log("✨ No valid media files to delete");
    }

    const summary = {
      success: true,
      duration: Date.now() - startTime,
      ...results,
      logs,
      timestamp: new Date().toISOString()
    };

    log(`\n✨ Media cleanup completed successfully:
    Duration: ${summary.duration}ms
    Files Found: ${results.foundFiles}
    Deleted from Storage: ${results.deletedFromMinio}
    Deleted from Database: ${results.deletedFromDb}
    Errors: ${results.errors.length}`);

    return summary;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`❌ Media cleanup failed: ${errorMessage}`);
    console.error(
      "Cleanup error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return {
      success: false,
      duration: Date.now() - startTime,
      ...results,
      error: errorMessage,
      logs,
      timestamp: new Date().toISOString()
    };
  } finally {
    try {
      await prisma.$disconnect();
      log("👋 Database connection closed");
    } catch (_error) {
      log("❌ Error closing database connection");
    }
  }
}

export async function POST(request: Request) {
  console.log("📥 Received media cleanup request");

  try {
    if (!process.env.CRON_SECRET_KEY) {
      console.error("❌ CRON_SECRET_KEY environment variable not set");
      return NextResponse.json(
        {
          error: "Server configuration error",
          timestamp: new Date().toISOString()
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET_KEY}`;

    if (!authHeader || authHeader !== expectedAuth) {
      console.warn("⚠️ Unauthorized media cleanup attempt");
      return NextResponse.json(
        {
          error: "Unauthorized",
          timestamp: new Date().toISOString()
        },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    const results = await cleanupUnusedMedia();

    return NextResponse.json(results, {
      status: results.success ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("❌ Media cleanup route error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
