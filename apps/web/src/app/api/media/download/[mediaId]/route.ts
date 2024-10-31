import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { validateRequest } from "@zephyr/auth/auth";
import { prisma, redis } from "@zephyr/db";
import { type NextRequest, NextResponse } from "next/server";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
});

export const dynamic = "force-dynamic";

const DOWNLOAD_COOLDOWN = 120; // 2 minutes in seconds

export async function GET(
  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  request: NextRequest,
  context: { params: Promise<{ mediaId: string }> }
): Promise<NextResponse | Response> {
  const { mediaId } = await context.params;

  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check rate limit
    const downloadKey = `download:${user.id}:${mediaId}`;
    const lastDownload = await redis.get(downloadKey);

    if (lastDownload) {
      const timeLeft =
        DOWNLOAD_COOLDOWN -
        Math.floor((Date.now() - Number(lastDownload)) / 1000);
      if (timeLeft > 0) {
        return new NextResponse(
          JSON.stringify({
            error: "Rate limit exceeded",
            message: `Please wait ${timeLeft} seconds before downloading this file again`,
            timeLeft
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }
    }

    // Get media
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: {
        key: true,
        type: true,
        post: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!media) {
      return new NextResponse("Media not found", { status: 404 });
    }

    // Set rate limit
    await redis.set(downloadKey, Date.now(), {
      ex: DOWNLOAD_COOLDOWN // Expire key after cooldown period
    });

    // Generate signed URL with specific headers for download
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: media.key,
      ResponseContentDisposition: `attachment; filename="${media.key.split("/").pop()}"`
    });

    const url = await getSignedUrl(r2Client, command, {
      expiresIn: 60
    });

    const response = await fetch(url);
    const blob = await response.blob();

    return new Response(blob, {
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${media.key.split("/").pop()}"`,
        "Content-Length": response.headers.get("Content-Length") || ""
      }
    });
  } catch (error) {
    console.error("Download failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
