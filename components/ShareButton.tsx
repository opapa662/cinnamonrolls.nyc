"use client";

import { useState } from "react";

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  variant?: "icon" | "pill";
  style?: React.CSSProperties;
}

export default function ShareButton({ url, title, text, variant = "pill", style }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share && navigator.canShare?.({ url, title })) {
      try {
        await navigator.share({ url, title, text });
        return;
      } catch {
        // user dismissed — do nothing
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silent fail
    }
  }

  const shareIcon = (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 1v9M5 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 8v5a1 1 0 001 1h8a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  if (variant === "icon") {
    return (
      <button
        onClick={handleShare}
        aria-label="Share"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 4,
          flexShrink: 0,
          lineHeight: 1,
          color: "rgba(139,69,19,0.45)",
          outline: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
      >
        {copied ? (
          <span style={{ fontSize: 10, fontWeight: 700, color: "#9C6B3C" }}>✓</span>
        ) : shareIcon}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "1px solid rgba(139,69,19,0.25)",
        borderRadius: 20,
        padding: "5px 14px",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--cr-brown)",
        cursor: "pointer",
        outline: "none",
        ...style,
      }}
    >
      {shareIcon}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
