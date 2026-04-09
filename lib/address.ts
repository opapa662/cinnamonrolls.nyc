/**
 * Strips zip code and country suffix from a Google-formatted address.
 * "123 Mott St, New York, NY 10013, USA" → "123 Mott St, New York, NY"
 */
export function cleanAddress(addr: string): string {
  return addr
    .replace(/,?\s*\d{5}(-\d{4})?/, "")
    .replace(/,\s*USA$/i, "")
    .trim();
}
