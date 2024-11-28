import { MINIO_BUCKET, minioClient, validateBucket } from "@/lib/minio";
import {
  getContentDisposition,
  shouldDisplayInline
} from "@/lib/utils/mime-utils";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ mediaId: string }> }
): Promise<NextResponse | Response> {
  const { mediaId } = await context.params;
  if (!mediaId) {
    return new NextResponse("Media ID is required", { status: 400 });
  }

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      key: true,
      mimeType: true,
      type: true
    }
  });

  if (!media) {
    return new NextResponse("Media not found", { status: 404 });
  }

  const bucketExists = await validateBucket();
  if (!bucketExists) {
    return new NextResponse("Storage configuration error", { status: 500 });
  }

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
      Bucket: MINIO_BUCKET,
      Key: media.key
    });

    const response = await minioClient.send(command);

    if (!response.Body) {
      return new NextResponse("Media content not found", { status: 404 });
    }

    const headers = new Headers();

    headers.set(
      "Content-Type",
      media.mimeType || response.ContentType || "application/octet-stream"
    );

    const filename = media.key.split("/").pop() || "file";
    const inline = !download && shouldDisplayInline(media.mimeType);
    headers.set("Content-Disposition", getContentDisposition(filename, inline));

    headers.set("Cache-Control", "public, max-age=31536000");

    if (response.ContentLength) {
      headers.set("Content-Length", response.ContentLength.toString());
    }

    return new NextResponse(response.Body.transformToWebStream(), { headers });
  } catch (error) {
    console.error("Media proxy error:", error);
    return new NextResponse(
      `Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
