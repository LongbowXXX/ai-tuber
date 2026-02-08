/**
 * Resolves the absolute path for a static asset.
 * Returns the path prefixed with BASE_URL (which might be relative like './' in Electron).
 *
 * @param path - The path to the asset (e.g., "/avatars.json" or "avatars.json")
 * @returns The resolved absolute path
 */
export function toAssetPath(path: string): string {
  // Remove leading slash if present to avoid double slashes when joining
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // import.meta.env.BASE_URL is set by Vite (defaults to '/' in dev, './' in prod if configured)
  // We need to handle the case where BASE_URL is './' for electron relative paths
  const baseUrl = import.meta.env.BASE_URL;

  if (baseUrl === './') {
    return `${cleanPath}`;
  }

  return `${baseUrl}${cleanPath}`;
}
