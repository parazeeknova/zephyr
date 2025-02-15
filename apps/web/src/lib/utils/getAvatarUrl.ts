// @ts-expect-error - no types for image files
import fallback from '@assets/general/avatar-placeholder.png';

export const getAvatarUrl = (avatarUrl: string | null | undefined): string => {
  if (!avatarUrl) {
    return fallback.src;
  }
  return avatarUrl;
};
