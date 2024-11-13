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
  image: 25 * 1024 * 1024, // 25MB
  video: 250 * 1024 * 1024, // 250MB
  audio: 20 * 1024 * 1024, // 20MB
  document: 200 * 1024 * 1024, // 200MB
  code: 10 * 1024 * 1024 // 10MB
};

export const minioClient = new S3Client({
  region: "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER || "minioadmin",
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin"
  },
  forcePathStyle: true,
  maxAttempts: 3
});

export const MINIO_BUCKET = process.env.MINIO_BUCKET_NAME || "uploads";

export const getPublicUrl = (key: string) => {
  if (!key) throw new Error("File key is required");
  const endpoint =
    process.env.NEXT_PUBLIC_MINIO_ENDPOINT || "http://localhost:9001";
  return `${endpoint}/${MINIO_BUCKET}/${encodeURIComponent(key)}`;
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
    Bucket: process.env.MINIO_BUCKET_NAME || "uploads",
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
      Bucket: process.env.MINIO_BUCKET_NAME || "uploads",
      Key: key
    });
    await minioClient.send(command);
    return true;
  } catch (_error) {
    return false;
  }
};

export const getContentType = (filename: string): string => {
  const extension = filename.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    webm: "video/webm",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    ts: "text/typescript",
    json: "application/json",
    md: "text/markdown",
    py: "text/x-python",
    java: "text/x-java",
    c: "text/x-c",
    cpp: "text/x-cpp",
    cs: "text/x-csharp",
    rb: "text/x-ruby",
    php: "text/x-php",
    rs: "text/x-rust",
    go: "text/x-go",
    kt: "text/x-kotlin",
    swift: "text/x-swift",
    xml: "application/xml",
    yaml: "text/x-yaml",
    yml: "text/x-yaml",
    sql: "text/x-sql"
  };

  return extension
    ? mimeTypes[extension] || "application/octet-stream"
    : "application/octet-stream";
};

export const getContentDisposition = (filename: string, inline = false) => {
  if (!filename) throw new Error("Filename is required");
  const utf8Filename = encodeURIComponent(filename.trim());
  return `${inline ? "inline" : "attachment"}; filename="${utf8Filename}"`;
};

export const shouldDisplayInline = (mimeType: string) => {
  const inlineTypes = [
    "image/",
    "video/",
    "audio/",
    "text/",
    "application/pdf",
    "application/json"
  ];
  return inlineTypes.some((type) => mimeType.startsWith(type));
};
