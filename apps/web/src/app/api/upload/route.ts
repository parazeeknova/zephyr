import { uploadToMinio } from '@/lib/minio';
import type { MediaType } from '@prisma/client';
import { validateRequest } from '@zephyr/auth/auth';
import { prisma } from '@zephyr/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const postId = formData.get('postId') as string | null;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      postId: postId,
    });

    const upload = await uploadToMinio(file, user.id);

    const media = await prisma.media.create({
      data: {
        url: upload.url,
        type: upload.type as MediaType,
        key: upload.key,
        mimeType: upload.mimeType,
        size: upload.size,
        postId: postId,
      },
    });

    return NextResponse.json({
      mediaId: media.id,
      url: upload.url,
      key: upload.key,
      type: media.type,
    });
  } catch (error: unknown) {
    console.error('Upload route error:', error);
    console.error({
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    const errorMessage =
      error?.message || 'Internal server error during upload';
    const statusCode = error?.status || 500;

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: statusCode }
    );
  }
}
