export function getSecureImageUrl(url: string): string {
  if (!url) return '';

  if (process.env.NODE_ENV === 'development') {
    // In development, use HTTP for localhost
    if (url.includes('localhost')) {
      return url.replace('https://', 'http://');
    }
  }

  // In production, always use HTTPS
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }

  return url;
}
