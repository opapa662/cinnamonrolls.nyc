export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Always pass loc.name (not display_name) — groups multi-location brands onto one page
export function locationSlug(name: string): string {
  return toSlug(name);
}
