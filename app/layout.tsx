import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Footer from "@/components/Footer";
import MobileFooter from "@/components/MobileFooter";
import AnalyticsInit from "@/components/AnalyticsInit";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://cinnamonrolls.nyc"),
  title: "cinnamonrolls.nyc - the ultimate map of the city's best swirls",
  description:
    "An interactive map of NYC's best cinnamon roll spots. Find the perfect swirl near you — by neighborhood, borough, or wherever you are.",
  icons: { icon: "/icon.png", apple: "/icon.png" },
  alternates: {
    canonical: "https://cinnamonrolls.nyc",
  },
  openGraph: {
    type: "website",
    url: "https://cinnamonrolls.nyc",
    siteName: "cinnamonrolls.nyc",
    title: "the ultimate map of the city's best swirls",
    images: [{ url: "https://cinnamonrolls.nyc/icon.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "cinnamonrolls.nyc - the ultimate map of the city's best swirls",
    images: ["https://cinnamonrolls.nyc/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
        <link rel="dns-prefetch" href="https://events.mapbox.com" />
        <link rel="dns-prefetch" href="https://a.tiles.mapbox.com" />
        <link rel="dns-prefetch" href="https://b.tiles.mapbox.com" />
        <link rel="dns-prefetch" href="https://c.tiles.mapbox.com" />
        <link rel="dns-prefetch" href="https://d.tiles.mapbox.com" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "cinnamonrolls.nyc",
          "url": "https://cinnamonrolls.nyc",
          "description": "An interactive map of NYC's best cinnamon roll spots.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": { "@type": "EntryPoint", "urlTemplate": "https://cinnamonrolls.nyc/?q={search_term_string}" },
            "query-input": "required name=search_term_string"
          }
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "cinnamonrolls.nyc",
          "url": "https://cinnamonrolls.nyc",
          "logo": "https://cinnamonrolls.nyc/icon.png",
          "sameAs": ["https://www.instagram.com/cinnamonrolls.nyc"]
        }) }} />
      </head>
      <body className="h-full flex flex-col font-[var(--font-inter)] antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <MobileFooter />
        <Footer />
        <AnalyticsInit />

        {/* GA4 — loaded after page is interactive via next/script */}
        {GA4_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA4_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
