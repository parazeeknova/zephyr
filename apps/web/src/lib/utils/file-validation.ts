import {
  allowedFileTypes,
  avatarConfig,
  maxFileSizes
} from "../config/file-config";
import type { AllowedFileType } from "../config/file-config";
import { getFileType } from "./mime-utils";

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

export const validateAvatar = (file: File) => {
  const { maxSize, allowedTypes } = avatarConfig;
  if (!allowedTypes.includes(file.type as any)) {
    throw new Error("Avatar must be JPEG, PNG, GIF, or WebP");
  }
  if (file.size > maxSize) {
    throw new Error("Avatar size must be less than 8MB");
  }

  return true;
};
