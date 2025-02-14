import { getContentDisposition, minioClient } from '@/lib/minio';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { validateRequest } from '@zephyr/auth/auth';
import { prisma, redis } from '@zephyr/db';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check rate limit using Redis
    const downloadKey = `download:${user.id}:${mediaId}`;
    const lastDownload = await redis.get(downloadKey);

    if (lastDownload) {
      const timeLeft =
        DOWNLOAD_COOLDOWN -
        Math.floor((Date.now() - Number(lastDownload)) / 1000);
      if (timeLeft > 0) {
        return new NextResponse(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: `Please wait ${timeLeft} seconds before downloading this file again`,
            timeLeft,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // Get media from database
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: {
        key: true,
        mimeType: true,
        type: true,
        post: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!media) {
      return new NextResponse('Media not found', { status: 404 });
    }

    // Set rate limit in Redis using two separate commands
    await redis.set(downloadKey, Date.now().toString());
    await redis.expire(downloadKey, DOWNLOAD_COOLDOWN);

    // Get filename from key
    const filename = media.key.split('/').pop() || 'download';

    // Generate signed URL with specific headers for download
    const command = new GetObjectCommand({
      Bucket: process.env.MINIO_BUCKET_NAME || 'uploads',
      Key: media.key,
      ResponseContentType: media.mimeType,
      ResponseContentDisposition: getContentDisposition(filename, false),
    });

    try {
      const response = await minioClient.send(command);

      if (!response.Body) {
        throw new Error('No response body from MinIO');
      }

      // Convert readable stream to blob
      const chunks = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      const blob = new Blob(chunks, { type: media.mimeType });

      return new Response(blob, {
        headers: {
          'Content-Type': media.mimeType || 'application/octet-stream',
          'Content-Disposition': getContentDisposition(filename, false),
          'Content-Length': response.ContentLength?.toString() || '',
          'Cache-Control': 'no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
    } catch (error) {
      console.error('MinIO download error:', error);
      return new NextResponse('File download failed', { status: 500 });
    }
  } catch (error) {
    console.error('Download failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
