import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
        {
          success: false,
          message: "Invalid authorization header",
          logs
        },
        { status: 401 }
      );
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
      select: {
        id: true,
        url: true
      }
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

    // Extract valid file keys
    const fileKeys = unusedMedia
      .map((m) => {
        try {
          return m.url.split(
            `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
          )[1];
        } catch (_error) {
          log(`⚠️ Invalid URL format for media ID ${m.id}`);
          return null;
        }
      })
      .filter((key): key is string => key !== null);

    log(`Processing ${fileKeys.length} valid file keys`);

    if (fileKeys.length > 0) {
      try {
        await new UTApi().deleteFiles(fileKeys);
        log("✅ Successfully deleted files from UploadThing");
      } catch (error) {
        log(
          `❌ Error deleting files from UploadThing: ${error instanceof Error ? error.message : String(error)}`
        );
        // Continue to database cleanup even if UploadThing deletion fails
      }
    }

    // Delete from database
    const deleteResult = await prisma.media.deleteMany({
      where: {
        id: {
          in: unusedMedia.map((m) => m.id)
        }
      }
    });

    log(`🗑️ Deleted ${deleteResult.count} records from database`);

    return NextResponse.json({
      success: true,
      message: "Cleanup completed successfully",
      deleted: deleteResult.count,
      filesProcessed: fileKeys.length,
      logs
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`❌ Error during cleanup: ${errorMessage}`);
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
