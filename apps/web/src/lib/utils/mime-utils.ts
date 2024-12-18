import type { FileCategory } from "../config/file-config";

export interface FileTypeConfig {
  mime: string;
  category: FileCategory;
  tag: {
    bg: string;
    text: string;
    icon: string;
  };
}

export const FILE_CONFIGS: Record<string, FileTypeConfig> = {
  jpg: {
    mime: "image/jpeg",
    category: "IMAGE",
    tag: { bg: "bg-blue-500/30", text: "text-blue-100", icon: "ImageIcon" }
  },
  jpeg: {
    mime: "image/jpeg",
    category: "IMAGE",
    tag: { bg: "bg-blue-500/30", text: "text-blue-100", icon: "ImageIcon" }
  },
  png: {
    mime: "image/png",
    category: "IMAGE",
    tag: { bg: "bg-green-500/30", text: "text-green-100", icon: "ImageIcon" }
  },
  gif: {
    mime: "image/gif",
    category: "IMAGE",
    tag: { bg: "bg-purple-500/30", text: "text-purple-100", icon: "ImageIcon" }
  },
  webp: {
    mime: "image/webp",
    category: "IMAGE",
    tag: { bg: "bg-yellow-500/30", text: "text-yellow-100", icon: "ImageIcon" }
  },
  heic: {
    mime: "image/heic",
    category: "IMAGE",
    tag: { bg: "bg-indigo-500/30", text: "text-indigo-100", icon: "ImageIcon" }
  },
  heif: {
    mime: "image/heif",
    category: "IMAGE",
    tag: { bg: "bg-indigo-500/30", text: "text-indigo-100", icon: "ImageIcon" }
  },
  svg: {
    mime: "image/svg+xml",
    category: "IMAGE",
    tag: { bg: "bg-orange-500/30", text: "text-orange-100", icon: "ImageIcon" }
  },
  tiff: {
    mime: "image/tiff",
    category: "IMAGE",
    tag: { bg: "bg-cyan-500/30", text: "text-cyan-100", icon: "ImageIcon" }
  },
  raw: {
    mime: "image/raw",
    category: "IMAGE",
    tag: { bg: "bg-red-500/30", text: "text-red-100", icon: "ImageIcon" }
  },

  // Videos
  mp4: {
    mime: "video/mp4",
    category: "VIDEO",
    tag: { bg: "bg-red-500/30", text: "text-red-100", icon: "VideoIcon" }
  },
  webm: {
    mime: "video/webm",
    category: "VIDEO",
    tag: { bg: "bg-purple-500/30", text: "text-purple-100", icon: "VideoIcon" }
  },
  mov: {
    mime: "video/quicktime",
    category: "VIDEO",
    tag: { bg: "bg-blue-500/30", text: "text-blue-100", icon: "VideoIcon" }
  },
  avi: {
    mime: "video/x-msvideo",
    category: "VIDEO",
    tag: { bg: "bg-gray-500/30", text: "text-gray-100", icon: "VideoIcon" }
  },
  mkv: {
    mime: "video/x-matroska",
    category: "VIDEO",
    tag: { bg: "bg-green-500/30", text: "text-green-100", icon: "VideoIcon" }
  },
  flv: {
    mime: "video/x-flv",
    category: "VIDEO",
    tag: { bg: "bg-yellow-500/30", text: "text-yellow-100", icon: "VideoIcon" }
  },

  // Audio
  mp3: {
    mime: "audio/mpeg",
    category: "AUDIO",
    tag: { bg: "bg-pink-500/30", text: "text-pink-100", icon: "AudioWaveform" }
  },
  wav: {
    mime: "audio/wav",
    category: "AUDIO",
    tag: { bg: "bg-blue-500/30", text: "text-blue-100", icon: "AudioWaveform" }
  },
  ogg: {
    mime: "audio/ogg",
    category: "AUDIO",
    tag: {
      bg: "bg-purple-500/30",
      text: "text-purple-100",
      icon: "AudioWaveform"
    }
  },
  aac: {
    mime: "audio/aac",
    category: "AUDIO",
    tag: { bg: "bg-red-500/30", text: "text-red-100", icon: "AudioWaveform" }
  },
  flac: {
    mime: "audio/flac",
    category: "AUDIO",
    tag: {
      bg: "bg-green-500/30",
      text: "text-green-100",
      icon: "AudioWaveform"
    }
  },
  m4a: {
    mime: "audio/mp4",
    category: "AUDIO",
    tag: {
      bg: "bg-yellow-500/30",
      text: "text-yellow-100",
      icon: "AudioWaveform"
    }
  },

  // Code
  js: {
    mime: "text/javascript",
    category: "CODE",
    tag: { bg: "bg-yellow-500/30", text: "text-yellow-100", icon: "CodeIcon" }
  },
  ts: {
    mime: "text/typescript",
    category: "CODE",
    tag: { bg: "bg-blue-500/30", text: "text-blue-100", icon: "CodeIcon" }
  },
  jsx: {
    mime: "text/jsx",
    category: "CODE",
    tag: { bg: "bg-cyan-500/30", text: "text-cyan-100", icon: "CodeIcon" }
  },
  tsx: {
    mime: "text/tsx",
    category: "CODE",
    tag: { bg: "bg-cyan-500/30", text: "text-cyan-100", icon: "CodeIcon" }
  },
  py: {
    mime: "text/x-python",
    category: "CODE",
    tag: { bg: "bg-green-500/30", text: "text-green-100", icon: "CodeIcon" }
  },
  java: {
    mime: "text/x-java",
    category: "CODE",
    tag: { bg: "bg-red-500/30", text: "text-red-100", icon: "CodeIcon" }
  },
  cpp: {
    mime: "text/x-cpp",
    category: "CODE",
    tag: { bg: "bg-blue-500/30", text: "text-blue-100", icon: "CodeIcon" }
  },
  c: {
    mime: "text/x-c",
    category: "CODE",
    tag: { bg: "bg-blue-500/30", text: "text-blue-100", icon: "CodeIcon" }
  },
  cs: {
    mime: "text/x-csharp",
    category: "CODE",
    tag: { bg: "bg-purple-500/30", text: "text-purple-100", icon: "CodeIcon" }
  },
  rb: {
    mime: "text/x-ruby",
    category: "CODE",
    tag: { bg: "bg-red-500/30", text: "text-red-100", icon: "CodeIcon" }
  },
  php: {
    mime: "text/x-php",
    category: "CODE",
    tag: { bg: "bg-purple-500/30", text: "text-purple-100", icon: "CodeIcon" }
  },
  go: {
    mime: "text/x-go",
    category: "CODE",
    tag: { bg: "bg-cyan-500/30", text: "text-cyan-100", icon: "CodeIcon" }
  },
  rs: {
    mime: "text/x-rust",
    category: "CODE",
    tag: { bg: "bg-orange-500/30", text: "text-orange-100", icon: "CodeIcon" }
  },
  swift: {
    mime: "text/x-swift",
    category: "CODE",
    tag: { bg: "bg-orange-500/30", text: "text-orange-100", icon: "CodeIcon" }
  },
  kt: {
    mime: "text/x-kotlin",
    category: "CODE",
    tag: { bg: "bg-purple-500/30", text: "text-purple-100", icon: "CodeIcon" }
  },

  // Documents
  pdf: {
    mime: "application/pdf",
    category: "DOCUMENT",
    tag: { bg: "bg-red-500/30", text: "text-red-100", icon: "FileTextIcon" }
  },
  doc: {
    mime: "application/msword",
    category: "DOCUMENT",
    tag: { bg: "bg-blue-500/30", text: "text-blue-100", icon: "FileTextIcon" }
  },
  docx: {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    category: "DOCUMENT",
    tag: { bg: "bg-blue-500/30", text: "text-blue-100", icon: "FileTextIcon" }
  },
  xls: {
    mime: "application/vnd.ms-excel",
    category: "DOCUMENT",
    tag: { bg: "bg-green-500/30", text: "text-green-100", icon: "FileTextIcon" }
  },
  xlsx: {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    category: "DOCUMENT",
    tag: { bg: "bg-green-500/30", text: "text-green-100", icon: "FileTextIcon" }
  },
  ppt: {
    mime: "application/vnd.ms-powerpoint",
    category: "DOCUMENT",
    tag: {
      bg: "bg-orange-500/30",
      text: "text-orange-100",
      icon: "FileTextIcon"
    }
  },
  pptx: {
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    category: "DOCUMENT",
    tag: {
      bg: "bg-orange-500/30",
      text: "text-orange-100",
      icon: "FileTextIcon"
    }
  },
  txt: {
    mime: "text/plain",
    category: "DOCUMENT",
    tag: { bg: "bg-gray-500/30", text: "text-gray-100", icon: "FileTextIcon" }
  },
  rtf: {
    mime: "application/rtf",
    category: "DOCUMENT",
    tag: { bg: "bg-gray-500/30", text: "text-gray-100", icon: "FileTextIcon" }
  },
  md: {
    mime: "text/markdown",
    category: "DOCUMENT",
    tag: { bg: "bg-blue-500/30", text: "text-blue-100", icon: "FileTextIcon" }
  }
};

export const getContentType = (filename: string): string => {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension
    ? FILE_CONFIGS[extension]?.mime || "application/octet-stream"
    : "application/octet-stream";
};

export const getContentDisposition = (filename: string, inline = false) => {
  if (!filename) throw new Error("Filename is required");
  const utf8Filename = encodeURIComponent(filename.trim());
  return `${inline ? "inline" : "attachment"}; filename="${utf8Filename}"`;
};

export const getTagConfig = (extension: string) => {
  return (
    FILE_CONFIGS[extension]?.tag || {
      bg: "bg-gray-500/30",
      text: "text-gray-100",
      icon: "FileIcon"
    }
  );
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

export const getFileCategory = (mimeType: string): FileCategory => {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  if (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/xml"
  )
    return "CODE";
  return "DOCUMENT";
};

export const normalizeMimeType = (mimeType: string | undefined): string => {
  if (!mimeType) return "application/octet-stream";
  if (mimeType.includes("quicktime")) return "video/mp4";
  if (mimeType.includes("x-matroska")) return "video/webm";
  return mimeType.toLowerCase();
};

export const getFileConfigFromMime = (mimeType: string | undefined) => {
  const normalizedMime = normalizeMimeType(mimeType);
  const config = Object.values(FILE_CONFIGS).find(
    (config) => config.mime === normalizedMime
  );

  if (config) return config;

  const category = getFileCategory(normalizedMime);
  return Object.values(FILE_CONFIGS).find(
    (config) => config.category === category
  );
};

export const getFileConfigFromExtension = (extension: string) => {
  return FILE_CONFIGS[extension.toLowerCase()];
};
