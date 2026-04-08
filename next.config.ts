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
      "img-src 'self' data: blob: https://*.mapbox.com https://www.google-analytics.com https://lh3.googleusercontent.com https://maps.googleapis.com",
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
