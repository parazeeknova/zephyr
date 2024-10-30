import { uploadToR2 } from "@/lib/r2";
import { validateRequest } from "@zephyr/auth/auth";
import { prisma } from "@zephyr/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    const upload = await uploadToR2(file, user.id);

    // Create media record
    const media = await prisma.media.create({
      data: {
        url: upload.url,
        type: upload.type.toUpperCase() as
          | "IMAGE"
          | "VIDEO"
          | "AUDIO"
          | "DOCUMENT",
        key: upload.key,
        mimeType: upload.mimeType,
        size: upload.size
      }
    });

    return NextResponse.json({
      mediaId: media.id,
      url: upload.url,
      key: upload.key
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
