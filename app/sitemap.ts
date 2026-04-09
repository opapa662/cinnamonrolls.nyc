import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { toSlug, locationSlug } from "@/lib/location-slug";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://cinnamonrolls.nyc";

  const { data: locations } = await supabase
    .from("locations")
    .select("name, neighborhood, borough")
    .eq("visible", true);

  const locs = locations ?? [];

  // Location detail pages
  const locationUrls: MetadataRoute.Sitemap = [...new Map(
    locs.map((l) => [locationSlug(l.name), l])
  ).values()].map((l) => ({
    url: `${base}/locations/${locationSlug(l.name)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Borough pages
  const boroughUrls: MetadataRoute.Sitemap = [...new Set(
    locs.map((l) => l.borough).filter(Boolean) as string[]
  )].map((b) => ({
    url: `${base}/boroughs/${toSlug(b)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Neighborhood pages
  const neighborhoodUrls: MetadataRoute.Sitemap = [...new Set(
    locs.map((l) => l.neighborhood).filter(Boolean) as string[]
  )].map((n) => ({
    url: `${base}/neighborhoods/${toSlug(n)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    // Guides
    { url: `${base}/guides`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/guides/best-cinnamon-rolls-nyc`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/guides/types-of-cinnamon-rolls`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/guides/best-cinnamon-rolls-brooklyn`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/guides/best-cinnamon-rolls-manhattan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/guides/best-cinnamon-rolls-queens`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/guides/best-cinnamon-rolls-west-village`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/guides/best-cinnamon-rolls-east-village`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/guides/best-cinnamon-rolls-greenpoint`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/guides/best-cinnamon-rolls-williamsburg`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/guides/best-cinnamon-rolls-prospect-heights`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/guides/best-cinnamon-rolls-brooklyn-heights`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    // Utility pages
    { url: `${base}/today`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/pop-ups`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/submit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...boroughUrls,
    ...neighborhoodUrls,
    ...locationUrls,
  ];
}
