import { uploadToMinio } from "@/lib/minio";
import { validateRequest } from "@zephyr/auth/auth";
import { NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
    maxDuration: 30
  }
};

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Invalid file format" },
        { status: 400 }
      );
    }

    const fileObject =
      file instanceof File
        ? file
        : new File([file], formData.get("fileName")?.toString() || "file", {
            type: formData.get("fileType")?.toString() || (file as Blob).type
          });

    const upload = await uploadToMinio(fileObject, `support/${user.id}`);

    return NextResponse.json({
      success: true,
      url: upload.url,
      key: upload.key,
      originalName: fileObject.name,
      size: fileObject.size,
      type: fileObject.type
    });
  } catch (error: any) {
    console.error("Support upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
