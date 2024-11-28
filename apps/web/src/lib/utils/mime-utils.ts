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
