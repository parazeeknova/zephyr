import https from "node:https";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { validateFile } from "./utils/file-validation";
import { getFileType } from "./utils/mime-utils";

export { getContentDisposition } from "./utils/mime-utils";

export const minioClient = new S3Client({
  region: "ap-south-1",
  endpoint:
    process.env.NODE_ENV === "production"
      ? "https://minio-objectstorage.zephyyrr.in"
      : process.env.MINIO_ENDPOINT || "http://localhost:9000",
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER || "minioadmin",
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin"
  },
  forcePathStyle: true,
  maxAttempts: 3,
  requestHandler: new NodeHttpHandler({
    httpsAgent: new https.Agent({
      rejectUnauthorized: process.env.NODE_ENV === "production"
    })
  })
});

export const MINIO_BUCKET = process.env.MINIO_BUCKET_NAME || "zephyr";

export const getPublicUrl = (key: string) => {
  if (!key) throw new Error("File key is required");

  const endpoint =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_MINIO_ENDPOINT
      : process.env.MINIO_ENDPOINT;

  const productionEndpoint = "https://minio-objectstorage.zephyyrr.in";

  const finalEndpoint =
    process.env.NODE_ENV === "production"
      ? productionEndpoint
      : endpoint || "http://localhost:9001";

  return `${finalEndpoint}/${MINIO_BUCKET}/${encodeURIComponent(key)}`;
};

export const validateBucket = async () => {
  try {
    const { HeadBucketCommand } = await import("@aws-sdk/client-s3");

    await minioClient.send(
      new HeadBucketCommand({
        Bucket: MINIO_BUCKET
      })
    );
    return true;
  } catch (error: any) {
    if (
      error.name === "NotFound" ||
      error.Code === "NoSuchBucket" ||
      error.$metadata?.httpStatusCode === 404
    ) {
      console.warn(`Bucket "${MINIO_BUCKET}" does not exist`);
      return false;
    }
    console.error("Error validating bucket:", error);
    throw new Error(`Failed to validate bucket: ${error.message}`);
  }
};

export const generatePresignedUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: key
  });

  return await getSignedUrl(minioClient, command, { expiresIn: 3600 });
};

export const uploadToMinio = async (file: File, userId: string) => {
  if (!file || !userId) throw new Error("File and userId are required");

  validateFile(file);
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniquePrefix = `${Date.now()}-${crypto.randomUUID()}`;
  const key = `${userId}/${uniquePrefix}-${cleanFileName}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await minioClient.send(
      new PutObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          userId,
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      })
    );

    const url = getPublicUrl(key);

    return {
      key,
      url,
      type: getFileType(file.type),
      mimeType: file.type,
      size: file.size,
      originalName: file.name
    };
  } catch (error) {
    console.error("MinIO upload error:", error);
    throw new Error("Failed to upload file to MinIO");
  }
};

export const checkFileExists = async (key: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: key
    });
    await minioClient.send(command);
    return true;
  } catch (_error) {
    return false;
  }
};

export const uploadAvatar = async (file: File, userId: string) => {
  if (!file || !userId) throw new Error("File and userId are required");

  const supportedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!supportedTypes.includes(file.type)) {
    throw new Error("Unsupported file type for avatar");
  }

  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    throw new Error("Avatar file size must be less than 8MB");
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `avatars/${userId}/${Date.now()}-${crypto.randomUUID()}-${cleanFileName}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await minioClient.send(
      new PutObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          userId,
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      })
    );

    const url = getPublicUrl(key);

    return {
      key,
      url,
      type: getFileType(file.type),
      mimeType: file.type,
      size: file.size
    };
  } catch (error) {
    console.error("MinIO avatar upload error:", error);
    throw new Error("Failed to upload avatar to MinIO");
  }
};

export const deleteAvatar = async (key: string) => {
  if (!key) return;

  try {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    await minioClient.send(
      new DeleteObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: key
      })
    );
  } catch (error) {
    console.error("Failed to delete avatar:", error);
    throw new Error("Failed to delete avatar from MinIO");
  }
};
