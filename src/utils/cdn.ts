// CDN utility functions

/**
 * Get the full CDN URL for a given path
 * @param path - The file path (e.g., "/masters/metals/gold.png")
 * @returns Full CDN URL (e.g., "https://aarshhmi.b-cdn.net/masters/metals/gold.png")
 */
export function getCdnUrl(path: string | null | undefined): string {
  if (!path) return ""

  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || ""
  if (!cdnUrl) return ""

  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : "/" + path
  return `${cdnUrl}${normalizedPath}`
}
