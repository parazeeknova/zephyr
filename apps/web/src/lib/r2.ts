import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type AllowedFileType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp"
  | "video/mp4"
  | "video/webm"
  | "audio/mpeg"
  | "audio/wav"
  | "audio/ogg"
  | "application/pdf"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain"
  | "text/html"
  | "text/css"
  | "text/javascript"
  | "text/typescript"
  | "application/json"
  | "text/markdown"
  | "text/x-python"
  | "text/x-java"
  | "text/x-c"
  | "text/x-cpp"
  | "text/x-csharp"
  | "text/x-ruby"
  | "text/x-php"
  | "text/x-rust"
  | "text/x-go"
  | "text/x-kotlin"
  | "text/x-swift"
  | "application/xml"
  | "text/x-yaml"
  | "text/x-sql";

export const allowedFileTypes: AllowedFileType[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/html",
  "text/css",
  "text/javascript",
  "text/typescript",
  "application/json",
  "text/markdown",
  "text/x-python",
  "text/x-java",
  "text/x-c",
  "text/x-cpp",
  "text/x-csharp",
  "text/x-ruby",
  "text/x-php",
  "text/x-rust",
  "text/x-go",
  "text/x-kotlin",
  "text/x-swift",
  "application/xml",
  "text/x-yaml",
  "text/x-sql"
];

export const maxFileSizes = {
  image: 5 * 1024 * 1024, // 5MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 20 * 1024 * 1024, // 20MB
  document: 50 * 1024 * 1024, // 50MB
  code: 10 * 1024 * 1024 // 10MB
};

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
});

export const getFileType = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/xml"
  )
    return "code";
  return "document";
};

export const validateFile = (file: File) => {
  const fileType = getFileType(file.type);
  const maxSize = maxFileSizes[fileType as keyof typeof maxFileSizes];

  if (!allowedFileTypes.includes(file.type as AllowedFileType)) {
    throw new Error("File type not supported");
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
  }

  return true;
};

export const generatePresignedUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key
  });

  return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
};

export const uploadToR2 = async (file: File, userId: string) => {
  validateFile(file);
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniquePrefix = `${Date.now()}-${crypto.randomUUID()}`;
  const key = `${userId}/${uniquePrefix}-${cleanFileName}`;

  await r2Client.send(
    new PutObjectCommand({
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      Metadata: {
        userId,
        originalName: file.name
      }
    })
  );

  const url = await generatePresignedUrl(key);

  return {
    key,
    url,
    type: getFileType(file.type),
    mimeType: file.type,
    size: file.size,
    originalName: file.name
  };
};
