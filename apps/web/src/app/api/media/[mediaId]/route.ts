import { r2Client } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

// Helper function to get content disposition
function getContentDisposition(filename: string, inline = false) {
  const utf8Filename = encodeURIComponent(filename);
  return `${inline ? "inline" : "attachment"}; filename="${utf8Filename}"`;
}

// Helper to determine if a file should be displayed inline
function shouldDisplayInline(mimeType: string) {
  const inlineTypes = [
    "image/",
    "video/",
    "audio/",
    "text/",
    "application/pdf",
    "application/json"
  ];
  return inlineTypes.some((type) => mimeType.startsWith(type));
}

export async function GET(
  request: Request,
  context: { params: Promise<{ mediaId: string }> }
): Promise<NextResponse | Response> {
  const { mediaId } = await context.params;

  try {
    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "true";

    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      return new NextResponse("Media not found", { status: 404 });
    }

    const command = new GetObjectCommand({
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: media.key
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      return new NextResponse("Media content not found", { status: 404 });
    }

    const headers = new Headers();

    // Set content type
    if (response.ContentType) {
      headers.set("Content-Type", response.ContentType);
    }

    // Set content disposition
    const filename = media.key.split("/").pop() || "file";
    const inline = !download && shouldDisplayInline(media.mimeType);
    headers.set("Content-Disposition", getContentDisposition(filename, inline));

    // Set caching headers
    headers.set("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

    // Set content length if available
    if (response.ContentLength) {
      headers.set("Content-Length", response.ContentLength.toString());
    }

    return new NextResponse(response.Body.transformToWebStream(), {
      headers
    });
  } catch (error) {
    console.error("Media proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
