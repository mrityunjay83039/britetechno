interface ShiprocketCache {
  token: string | null;
  expiry: number | null;
}

declare global {
  var shiprocketCache: ShiprocketCache | undefined;
}

// Global cache object to survive hot reloads in development
let cache = global.shiprocketCache;
if (!cache) {
  cache = global.shiprocketCache = { token: null, expiry: null };
}

/**
 * Format a Date object to Shiprocket's expected YYYY-MM-DD HH:mm format
 */
export function formatOrderDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

/**
 * Legacy Shiprocket helper (B2B Quote Requests do not use shipping fulfillment APIs)
 */
export async function getShiprocketToken(): Promise<string | null> {
  return null;
}
