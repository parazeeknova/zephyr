import {
  type AllowedAvatarExtension,
  avatarConfig,
  maxFileSizes,
} from '../config/file-config';
import { getFileConfigFromMime } from './mime-utils';

export const validateFile = (file: File) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const fileConfig = getFileConfigFromMime(file.type);
  console.log('File validation:', {
    type: file.type,
    config: fileConfig,
    size: file.size,
  });

  if (!fileConfig) {
    throw new Error(`File type ${file.type} not supported`);
  }

  const category = fileConfig.category;
  const maxSize = maxFileSizes[category];

  if (file.size > maxSize) {
    const sizeMB = Math.round(maxSize / (1024 * 1024));
    throw new Error(
      `File size must be less than ${sizeMB}MB for ${category} files`
    );
  }

  return true;
};

export const validateAvatar = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  const isAllowedExtension = (
    ext: string | undefined
  ): ext is AllowedAvatarExtension => {
    return (
      !!ext &&
      avatarConfig.allowedExtensions.includes(ext as AllowedAvatarExtension)
    );
  };

  if (!isAllowedExtension(extension)) {
    throw new Error('Avatar must be in JPG, PNG, GIF, WebP, or HEIC format');
  }

  if (file.size > avatarConfig.maxSize) {
    throw new Error('Avatar size must be less than 8MB');
  }

  return true;
};
