import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";
import MobileFooter from "@/components/MobileFooter";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "cinnamonrolls.nyc - the ultimate map of the city's best swirls",
  description:
    "An interactive map of NYC's best cinnamon roll spots. Find the perfect roll near you.",
  icons: { icon: "/icon.png", apple: "/icon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="h-full flex flex-col font-[var(--font-inter)] antialiased">
        {children}
        <MobileFooter />
        <Footer />
      </body>
    </html>
  );
}
