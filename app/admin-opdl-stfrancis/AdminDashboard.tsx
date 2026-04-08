"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Submission {
  id: string;
  submission_type: "addition" | "edit";
  name: string | null;
  website: string | null;
  address: string | null;
  comments: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_at: string | null;
  created_at: string;
  location: { id: string; name: string; display_name: string | null; neighborhood: string | null; borough: string | null } | null;
}

interface Location {
  id: string;
  name: string;
  display_name: string | null;
  neighborhood: string | null;
  borough: string | null;
  location_type: string | null;
  status: string;
  visible: boolean;
  website: string | null;
  instagram: string | null;
  notes: string | null;
  created_at: string;
}

interface Contact {
  id: string;
  name: string | null;
  email: string | null;
  message: string | null;
  created_at: string;
}

interface AnalyticsData {
  sessions7d: number;
  sessions30d: number;
  topPins: { name: string; count: number }[];
  topLocations: { name: string; count: number }[];
  deviceSplit: { name: string; count: number }[];
  outboundByType: { name: string; count: number }[];
}

interface Props {
  submissions: Submission[];
  locations: Location[];
  locationCount: number;
  contacts: Contact[];
  analytics: AnalyticsData;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#fff7ed", color: "#c2410c" },
  approved: { bg: "#f0fdf4", color: "#15803d" },
  rejected: { bg: "#fef2f2", color: "#b91c1c" },
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  addition: { bg: "#eff6ff", color: "#1d4ed8" },
  edit: { bg: "#fefce8", color: "#854d0e" },
};

export default function AdminDashboard({ submissions, locations, locationCount, contacts, analytics }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"submissions" | "contacts" | "locations" | "analytics">("submissions");
  const [subFilter, setSubFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [submissionStates, setSubmissionStates] = useState<Record<string, Submission["status"]>>({});
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [locationVisibility, setLocationVisibility] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const pendingCount = submissions.filter((s) => (submissionStates[s.id] ?? s.status) === "pending").length;

  const filteredSubmissions = submissions.filter((s) => {
    if (dismissedIds.has(s.id)) return false;
    const status = submissionStates[s.id] ?? s.status;
    return subFilter === "all" || status === subFilter;
  });

  const patch = useCallback(async (url: string, body: Record<string, unknown>, id: string) => {
    setLoading((p) => ({ ...p, [id]: true }));
    const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Error ${res.status}: ${data.error ?? "unknown error"}`);
    }
    setLoading((p) => ({ ...p, [id]: false }));
    return res.ok;
  }, []);

  const createDraft = useCallback(async (id: string) => {
    const ok = await patch(`/api/admin-opdl-stfrancis/submissions/${id}`, { action: "create_draft" }, id);
    if (ok) setSubmissionStates((p) => ({ ...p, [id]: "approved" }));
  }, [patch]);

  const rejectSubmission = useCallback(async (id: string) => {
    const ok = await patch(`/api/admin-opdl-stfrancis/submissions/${id}`, { action: "reject" }, id);
    if (ok) setSubmissionStates((p) => ({ ...p, [id]: "rejected" }));
  }, [patch]);

  const dismissSubmission = useCallback(async (id: string) => {
    const ok = await patch(`/api/admin-opdl-stfrancis/submissions/${id}`, { action: "dismiss" }, id);
    if (ok) setDismissedIds((p) => new Set([...p, id]));
  }, [patch]);

  const toggleVisibility = useCallback(async (loc: Location) => {
    const current = loc.id in locationVisibility ? locationVisibility[loc.id] : loc.visible;
    const next = !current;
    const ok = await patch(`/api/admin-opdl-stfrancis/locations/${loc.id}`, { visible: next }, loc.id);
    if (ok) setLocationVisibility((p) => ({ ...p, [loc.id]: next }));
  }, [locationVisibility, patch]);

  async function handleLogout() {
    await fetch("/api/admin-opdl-stfrancis/logout", { method: "POST" });
    router.push("/admin-opdl-stfrancis/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid rgba(139,69,19,0.1)", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" style={{ width: 24, height: 24 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--cr-brown-dark)" }}>Admin Dashboard</span>
          <span style={{ fontSize: 12, color: "var(--cr-brown-mid)", marginLeft: 4 }}>cinnamonrolls.nyc</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/admin-opdl-stfrancis/photos" style={{ fontSize: 13, color: "var(--cr-brown-mid)", textDecoration: "none" }}>Photos</Link>
          <Link href="/" style={{ fontSize: 13, color: "var(--cr-brown-mid)", textDecoration: "none" }}>← View site</Link>
          <button onClick={handleLogout} style={{ fontSize: 13, color: "var(--cr-brown-mid)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Active locations", value: locationCount },
            { label: "Pending submissions", value: pendingCount, highlight: pendingCount > 0 },
            { label: "Total submissions", value: submissions.length },
            { label: "Contact messages", value: contacts.length },
          ].map(({ label, value, highlight }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: `1px solid ${highlight ? "rgba(194,65,12,0.3)" : "rgba(139,69,19,0.1)"}`, boxShadow: highlight ? "0 0 0 3px rgba(194,65,12,0.08)" : "none" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: highlight ? "#c2410c" : "var(--cr-brown-dark)" }}>{value}</div>
              <div style={{ fontSize: 12, color: "var(--cr-brown-mid)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, background: "rgba(139,69,19,0.07)", borderRadius: 10, padding: 3, marginBottom: 24, width: "fit-content" }}>
          {(["submissions", "contacts", "locations", "analytics"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ padding: "7px 20px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", background: tab === t ? "#fff" : "transparent", color: tab === t ? "var(--cr-brown-dark)" : "var(--cr-brown-mid)", boxShadow: tab === t ? "0 1px 4px rgba(139,69,19,0.12)" : "none", fontFamily: "inherit", transition: "all 0.15s", textTransform: "capitalize" }}
            >
              {t}{t === "submissions" && pendingCount > 0 ? ` (${pendingCount})` : ""}
            </button>
          ))}
        </div>

        {/* Submissions */}
        {tab === "submissions" && (
          <div>
            {/* Filter chips */}
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {(["pending", "all", "approved", "rejected"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setSubFilter(f)}
                  style={{ padding: "5px 14px", fontSize: 12, fontWeight: 600, borderRadius: 20, border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", borderColor: subFilter === f ? "var(--cr-brown)" : "rgba(139,69,19,0.2)", background: subFilter === f ? "var(--cr-brown)" : "#fff", color: subFilter === f ? "#fff" : "var(--cr-brown-mid)", textTransform: "capitalize" }}
                >
                  {f}
                </button>
              ))}
            </div>

            {filteredSubmissions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--cr-brown-mid)", fontSize: 14 }}>
                No {subFilter !== "all" ? subFilter : ""} submissions
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredSubmissions.map((sub) => {
                  const status = submissionStates[sub.id] ?? sub.status;
                  const isPending = status === "pending";
                  const statusColor = STATUS_COLORS[status];
                  const typeColor = TYPE_COLORS[sub.submission_type];

                  return (
                    <div key={sub.id} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(139,69,19,0.1)", opacity: loading[sub.id] ? 0.6 : 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: typeColor.bg, color: typeColor.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {sub.submission_type === "addition" ? "New Spot" : "Edit"}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: statusColor.bg, color: statusColor.color, textTransform: "capitalize" }}>
                            {status}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--cr-brown-mid)" }}>{timeAgo(sub.created_at)}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {isPending ? (
                            <>
                              <button
                                onClick={() => createDraft(sub.id)}
                                disabled={loading[sub.id]}
                                style={{ padding: "6px 16px", fontSize: 12, fontWeight: 600, background: "#15803d", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}
                              >
                                Create Draft Location
                              </button>
                              <button
                                onClick={() => rejectSubmission(sub.id)}
                                disabled={loading[sub.id]}
                                style={{ padding: "6px 16px", fontSize: 12, fontWeight: 600, background: "#fff", color: "#b91c1c", border: "1.5px solid #b91c1c", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => dismissSubmission(sub.id)}
                              disabled={loading[sub.id]}
                              style={{ padding: "6px 16px", fontSize: 12, fontWeight: 600, background: "#fff", color: "var(--cr-brown-mid)", border: "1.5px solid rgba(139,69,19,0.25)", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}
                            >
                              Clear from Dashboard
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                        {sub.submission_type === "edit" && sub.location && (
                          <Row label="Location" value={sub.location.display_name || sub.location.name} />
                        )}
                        {sub.name && <Row label="Name" value={sub.name} />}
                        {sub.website && <Row label="Website" value={sub.website} />}
                        {sub.address && <Row label="Address" value={sub.address} />}
                        {sub.comments && <Row label="Notes" value={sub.comments} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Contacts */}
        {tab === "contacts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {contacts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--cr-brown-mid)", fontSize: 14 }}>No contact messages yet</div>
            ) : (
              contacts.map((c) => (
                <div key={c.id} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(139,69,19,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--cr-brown-dark)" }}>{c.name ?? "(no name)"}</span>
                    {c.email && (
                      <a href={`mailto:${c.email}`} style={{ fontSize: 13, color: "#3b6fc4", textDecoration: "none" }}>{c.email}</a>
                    )}
                    <span style={{ fontSize: 11, color: "var(--cr-brown-mid)", marginLeft: "auto" }}>{timeAgo(c.created_at)}</span>
                  </div>
                  {c.message && (
                    <p style={{ fontSize: 13, color: "#5a3a1a", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{c.message}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Analytics */}
        {tab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Session stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(139,69,19,0.1)" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: "var(--cr-brown-dark)" }}>{analytics.sessions7d}</div>
                <div style={{ fontSize: 12, color: "var(--cr-brown-mid)", marginTop: 2 }}>Sessions — last 7 days</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(139,69,19,0.1)" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: "var(--cr-brown-dark)" }}>{analytics.sessions30d}</div>
                <div style={{ fontSize: 12, color: "var(--cr-brown-mid)", marginTop: 2 }}>Sessions — last 30 days</div>
              </div>
            </div>

            {/* Device split + outbound */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <AnalyticsCard title="Device split (30d)" rows={analytics.deviceSplit} />
              <AnalyticsCard title="Outbound clicks by type (30d)" rows={analytics.outboundByType} />
            </div>

            {/* Top pins + location pages */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <AnalyticsCard title="Top pins clicked (30d)" rows={analytics.topPins} />
              <AnalyticsCard title="Top location pages (30d)" rows={analytics.topLocations} />
            </div>

            <div style={{ fontSize: 12, color: "var(--cr-brown-mid)" }}>Data from last 30 days · refreshes on page load</div>
          </div>
        )}

        {/* Locations */}
        {tab === "locations" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {locations.map((loc) => {
              const isVisible = loc.id in locationVisibility ? locationVisibility[loc.id] : loc.visible;
              return (
                <div key={loc.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", border: "1px solid rgba(139,69,19,0.1)", display: "flex", alignItems: "center", gap: 14, opacity: isVisible ? 1 : 0.55 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--cr-brown-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {loc.display_name || loc.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--cr-brown-mid)", marginTop: 2 }}>
                      {[loc.neighborhood, loc.borough, loc.location_type].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                    {loc.website && (
                      <a href={loc.website} target="_blank" rel="noopener" style={{ fontSize: 11, color: "var(--cr-brown-mid)", textDecoration: "none" }}>Website ↗</a>
                    )}
                    <button
                      onClick={() => toggleVisibility(loc)}
                      disabled={loading[loc.id]}
                      style={{ padding: "5px 12px", fontSize: 11, fontWeight: 600, borderRadius: 6, border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", borderColor: isVisible ? "#b91c1c" : "#15803d", background: isVisible ? "#fff" : "#f0fdf4", color: isVisible ? "#b91c1c" : "#15803d" }}
                    >
                      {isVisible ? "Remove from Map" : "Publish to Map"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
      <span style={{ color: "var(--cr-brown-mid)", fontWeight: 500, minWidth: 64, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "var(--cr-brown-dark)" }}>{value}</span>
    </div>
  );
}

function AnalyticsCard({ title, rows }: { title: string; rows: { name: string; count: number }[] }) {
  const max = rows[0]?.count ?? 1;
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(139,69,19,0.1)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#9C6B3C", marginBottom: 14, textTransform: "uppercase" }}>{title}</div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--cr-brown-mid)" }}>No data yet</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map(({ name, count }) => (
            <div key={name}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: "var(--cr-brown-dark)", fontWeight: 500 }}>{name}</span>
                <span style={{ color: "var(--cr-brown-mid)" }}>{count}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(139,69,19,0.08)" }}>
                <div style={{ height: 4, borderRadius: 2, background: "var(--cr-brown)", width: `${Math.round((count / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
