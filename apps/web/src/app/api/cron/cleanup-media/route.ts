import { r2Client } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const logs: string[] = [];
  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  try {
    const authHeader = req.headers.get("Authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { message: "Invalid authorization header" },
        { status: 401 }
      );
    }

    // Find unused media files
    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null,
        createdAt: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        key: true
      }
    });

    log(`Found ${unusedMedia.length} unused media files`);

    // Filter out entries without keys
    const validMedia = unusedMedia.filter((m) => m.key);

    if (validMedia.length > 0) {
      log(`Deleting ${validMedia.length} files from R2`);
      try {
        await Promise.all(
          validMedia.map((media) =>
            r2Client.send(
              new DeleteObjectCommand({
                // biome-ignore lint/style/noNonNullAssertion: <explanation>
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: media.key
              })
            )
          )
        );
        log("✅ R2 deletion successful");

        // Delete from database after R2 deletion succeeds
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
        log(`❌ Error during cleanup: ${errorMessage}`);
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
    console.error("Cleanup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        logs
      },
      { status: 500 }
    );
  }
}
