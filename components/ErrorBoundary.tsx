"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { logError } from "@/lib/analytics";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError({
      error_message: error.message,
      error_type: "react_render_error",
      stack_trace: error.stack,
      component_stack: info.componentStack ?? undefined,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: 32,
          fontFamily: "var(--font-inter), -apple-system, sans-serif",
          textAlign: "center",
          background: "var(--cr-cream)",
        }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🍥</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--cr-brown-dark)", marginBottom: 8 }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 14, color: "#9C6B3C", marginBottom: 24 }}>
            Try refreshing the page — the rolls aren&apos;t going anywhere.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              background: "var(--cr-brown)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
