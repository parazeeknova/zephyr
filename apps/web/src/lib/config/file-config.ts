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
} as const;

export const avatarConfig = {
  maxSize: 8 * 1024 * 1024, // 8MB
  allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"] as const
};
