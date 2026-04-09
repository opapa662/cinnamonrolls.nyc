"use client";

import { supabase } from "@/lib/supabase";

// ── Session ID ────────────────────────────────────────────────────────────────
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const key = "cr-session-id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

// ── UTM params ────────────────────────────────────────────────────────────────
interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

function getUtmParams(): UtmParams {
  if (typeof window === "undefined") return { utm_source: null, utm_medium: null, utm_campaign: null };
  const key = "cr-utm";
  const stored = sessionStorage.getItem(key);
  if (stored) return JSON.parse(stored) as UtmParams;
  const p = new URLSearchParams(window.location.search);
  const params: UtmParams = {
    utm_source: p.get("utm_source"),
    utm_medium: p.get("utm_medium"),
    utm_campaign: p.get("utm_campaign"),
  };
  if (params.utm_source) sessionStorage.setItem(key, JSON.stringify(params));
  return params;
}

// ── Event types ───────────────────────────────────────────────────────────────
export type EventName =
  | "session_start"
  | "map_loaded"
  | "pin_clicked"
  | "popup_opened"
  | "popup_closed"
  | "popup_link_clicked"
  | "map_zoomed"
  | "map_panned"
  | "map_bounds_changed"
  | "map_style_error"
  | "geolocation_requested"
  | "geolocation_success"
  | "geolocation_denied"
  | "outbound_click"
  | "location_page_viewed"
  | "location_to_map_nav"
  | "card_clicked"
  | "surprise_me_clicked"
  | "saved_mode_toggled"
  | "search_opened"
  | "filter_applied"
  | "client_error"
  | "map_error"
  | "web_vital";

// ── Core trackEvent ───────────────────────────────────────────────────────────
export function trackEvent(eventName: EventName, properties: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  try {
    const utm = getUtmParams();
    const sessionId = getSessionId();

    // Send to GA4 directly via gtag()
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, { ...properties, session_id: sessionId });
    }

    // Fire-and-forget to Supabase
    supabase.from("analytics_events").insert({
      session_id: sessionId,
      event_name: eventName,
      properties,
      page_url: window.location.href,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
    }).then(() => {}, () => {});
  } catch {
    // never throw from analytics
  }
}

// ── Log error to Supabase ─────────────────────────────────────────────────────
export function logError(params: {
  error_message: string;
  error_type?: string;
  stack_trace?: string;
  source_file?: string;
  line_number?: number;
  column_number?: number;
  component_stack?: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    supabase.from("error_logs").insert({
      session_id: getSessionId(),
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      ...params,
    }).then(() => {}, () => {});

    trackEvent("client_error", {
      error_type: params.error_type ?? "unknown",
      error_message: params.error_message.slice(0, 200),
    });
  } catch {
    // never throw from error logging
  }
}

// ── Web Vitals ────────────────────────────────────────────────────────────────
export function initWebVitals(): void {
  if (typeof window === "undefined") return;
  import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    const report = (metric: { name: string; value: number; rating: string }) => {
      trackEvent("web_vital", {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        metric_rating: metric.rating,
      });
    };
    onCLS(report);
    onINP(report);
    onLCP(report);
    onFCP(report);
    onTTFB(report);
  }).catch(() => {});
}

// ── Analytics init (call once on mount) ──────────────────────────────────────
let analyticsInitialized = false;

export function initAnalytics(): void {
  if (typeof window === "undefined") return;
  if (analyticsInitialized) return;
  analyticsInitialized = true;
  try {
    // Capture UTM params on first load
    getUtmParams();

    // session_start
    trackEvent("session_start", {
      referrer: document.referrer || null,
      device_type: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    });

    // Global JS error handler
    window.onerror = (message, source, lineno, colno, error) => {
      logError({
        error_message: String(message),
        error_type: "js_error",
        stack_trace: error?.stack,
        source_file: source,
        line_number: lineno ?? undefined,
        column_number: colno ?? undefined,
      });
      return false;
    };

    // Unhandled promise rejections
    window.addEventListener("unhandledrejection", (e) => {
      logError({
        error_message: String(e.reason?.message ?? e.reason ?? "Unhandled rejection"),
        error_type: "unhandled_rejection",
        stack_trace: e.reason?.stack,
      });
    });

    // Web Vitals
    initWebVitals();
  } catch {
    // never throw from analytics init
  }
}

// ── Debounce utility ──────────────────────────────────────────────────────────
export function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

// ── Global type augmentation ──────────────────────────────────────────────────
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}
