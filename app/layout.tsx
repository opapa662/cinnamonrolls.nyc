import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
        <Footer />
      </body>
    </html>
  );
}
