/** Normalize usernames for profiles and auth metadata (lowercase, allowed chars only). */
export function sanitizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}
