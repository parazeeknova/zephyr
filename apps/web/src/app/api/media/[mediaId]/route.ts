import {
  getContentDisposition,
  minioClient,
  shouldDisplayInline
} from "@/lib/minio";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

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

    const response = await minioClient.send(command);

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
