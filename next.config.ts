import type { NextConfig } from "next";
import path from "path";

const securityHeaders = [
  // Prevent clickjacking — disallow embedding in iframes on other domains
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send origin in Referer header (no full path) for cross-origin requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable unused browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)",
  },
  // CSP: tuned for Mapbox GL JS (needs unsafe-eval + blob workers) + Supabase
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Mapbox requires unsafe-eval; Next.js requires unsafe-inline for hydration scripts; GTM + GA4 need googletagmanager.com
      "script-src 'self' blob: 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
      // Mapbox and Next.js use inline styles
      "style-src 'self' 'unsafe-inline'",
      // Map tiles, data URIs, blobs, GA4 beacon
      "img-src 'self' data: blob: https://*.mapbox.com https://www.google-analytics.com https://lh3.googleusercontent.com https://maps.googleapis.com https://*.supabase.co",
      // Mapbox tiles/API/WebSockets + Supabase + GA4/GTM
      "connect-src 'self' https://*.mapbox.com wss://*.mapbox.com https://events.mapbox.com https://www.mapbox.com https://*.supabase.co blob: https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com",
      // Mapbox web workers run as blob URLs
      "worker-src blob:",
      // Google Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // No embedding by other sites
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["mapbox-gl"],
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      // Borough pages → guide equivalents
      { source: "/boroughs/manhattan", destination: "/guides/best-cinnamon-rolls-manhattan", permanent: true },
      { source: "/boroughs/brooklyn", destination: "/guides/best-cinnamon-rolls-brooklyn", permanent: true },
      { source: "/boroughs/queens", destination: "/guides/best-cinnamon-rolls-queens", permanent: true },
      { source: "/boroughs/:slug", destination: "/guides/best-cinnamon-rolls-nyc", permanent: true },
      // Neighborhood pages with dedicated guides
      { source: "/neighborhoods/west-village", destination: "/guides/best-cinnamon-rolls-west-village", permanent: true },
      { source: "/neighborhoods/east-village", destination: "/guides/best-cinnamon-rolls-east-village", permanent: true },
      { source: "/neighborhoods/greenpoint", destination: "/guides/best-cinnamon-rolls-greenpoint", permanent: true },
      { source: "/neighborhoods/williamsburg", destination: "/guides/best-cinnamon-rolls-williamsburg", permanent: true },
      { source: "/neighborhoods/prospect-heights", destination: "/guides/best-cinnamon-rolls-prospect-heights", permanent: true },
      { source: "/neighborhoods/brooklyn-heights", destination: "/guides/best-cinnamon-rolls-brooklyn-heights", permanent: true },
      // Other neighborhoods → borough guide
      { source: "/neighborhoods/upper-west-side", destination: "/guides/best-cinnamon-rolls-manhattan", permanent: true },
      { source: "/neighborhoods/lower-east-side", destination: "/guides/best-cinnamon-rolls-manhattan", permanent: true },
      { source: "/neighborhoods/union-square", destination: "/guides/best-cinnamon-rolls-manhattan", permanent: true },
      { source: "/neighborhoods/nomad", destination: "/guides/best-cinnamon-rolls-manhattan", permanent: true },
      { source: "/neighborhoods/midtown", destination: "/guides/best-cinnamon-rolls-manhattan", permanent: true },
      { source: "/neighborhoods/noho", destination: "/guides/best-cinnamon-rolls-manhattan", permanent: true },
      { source: "/neighborhoods/tribeca", destination: "/guides/best-cinnamon-rolls-manhattan", permanent: true },
      { source: "/neighborhoods/soho", destination: "/guides/best-cinnamon-rolls-manhattan", permanent: true },
      { source: "/neighborhoods/south-slope", destination: "/guides/best-cinnamon-rolls-brooklyn", permanent: true },
      { source: "/neighborhoods/bed-stuy", destination: "/guides/best-cinnamon-rolls-brooklyn", permanent: true },
      { source: "/neighborhoods/park-slope", destination: "/guides/best-cinnamon-rolls-brooklyn", permanent: true },
      { source: "/neighborhoods/astoria", destination: "/guides/best-cinnamon-rolls-queens", permanent: true },
      { source: "/neighborhoods/:slug", destination: "/guides/best-cinnamon-rolls-nyc", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
