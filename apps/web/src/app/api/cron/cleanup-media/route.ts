import { r2Client } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { message: "Invalid authorization header" },
        { status: 401 }
      );
    }

    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null,
        createdAt: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours old
        }
      },
      select: {
        id: true,
        key: true
      }
    });

    // Delete from R2
    await Promise.all(
      unusedMedia.map((media) =>
        r2Client.send(
          new DeleteObjectCommand({
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: media.key
          })
        )
      )
    );

    // Delete from database
    await prisma.media.deleteMany({
      where: {
        id: {
          in: unusedMedia.map((m) => m.id)
        }
      }
    });

    return NextResponse.json({
      deleted: unusedMedia.length
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
