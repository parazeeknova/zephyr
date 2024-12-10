export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // If we're in the browser, use the current window location
    return window.location.origin;
  }
  // For server-side
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
};
