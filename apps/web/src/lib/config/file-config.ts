import { FILE_CONFIGS } from "../utils/mime-utils";

export type FileCategory = "IMAGE" | "VIDEO" | "AUDIO" | "CODE" | "DOCUMENT";

export const maxFileSizes = {
  IMAGE: 25 * 1024 * 1024,
  VIDEO: 250 * 1024 * 1024,
  AUDIO: 20 * 1024 * 1024,
  DOCUMENT: 200 * 1024 * 1024,
  CODE: 10 * 1024 * 1024
} as const;

export const FILE_SIZE_UNITS = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024
} as const;

export type AllowedAvatarExtension =
  | "jpg"
  | "jpeg"
  | "png"
  | "gif"
  | "webp"
  | "heic"
  | "heif";

export const avatarConfig = {
  maxSize: 8 * 1024 * 1024,
  allowedExtensions: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "heic",
    "heif"
  ] as AllowedAvatarExtension[]
} as const;

export const getAllowedMimeTypes = () => {
  return Object.values(FILE_CONFIGS).map((config) => config.mime);
};

export type AllowedFileType = ReturnType<typeof getAllowedMimeTypes>[number];

export const allowedFileTypes = getAllowedMimeTypes();

export const formatFileSize = (bytes: number): string => {
  if (bytes < FILE_SIZE_UNITS.MB) {
    return `${(bytes / FILE_SIZE_UNITS.KB).toFixed(2)} KB`;
  }
  return `${(bytes / FILE_SIZE_UNITS.MB).toFixed(2)} MB`;
};
