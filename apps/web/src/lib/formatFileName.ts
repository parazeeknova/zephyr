export function formatFileName(
  key: string | undefined,
  fallback = 'Unknown file'
): string {
  if (!key) return fallback;
  const fileName = key.split('/').pop() || fallback;
  const cleanName = fileName.replace(/^(\d+[-_])?[a-f0-9-]+[-_]?/, '');

  try {
    return decodeURIComponent(cleanName);
  } catch {
    return cleanName;
  }
}

export function truncateFileName(fileName: string, maxLength = 25): string {
  if (fileName.length <= maxLength) return fileName;

  const extension = fileName.split('.').pop();
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));

  const truncatedName = nameWithoutExt.substring(
    0,
    maxLength - 3 - (extension?.length || 0)
  );
  return `${truncatedName}...${extension ? `.${extension}` : ''}`;
}
