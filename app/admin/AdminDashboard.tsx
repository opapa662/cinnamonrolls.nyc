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
  website: string | null;
  instagram: string | null;
  notes: string | null;
  created_at: string;
}

interface Props {
  submissions: Submission[];
  locations: Location[];
  locationCount: number;
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

export default function AdminDashboard({ submissions, locations, locationCount }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"submissions" | "locations">("submissions");
  const [subFilter, setSubFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [submissionStates, setSubmissionStates] = useState<Record<string, Submission["status"]>>({});
  const [locationStates, setLocationStates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const pendingCount = submissions.filter((s) => (submissionStates[s.id] ?? s.status) === "pending").length;

  const filteredSubmissions = submissions.filter((s) => {
    const status = submissionStates[s.id] ?? s.status;
    return subFilter === "all" || status === subFilter;
  });

  const updateSubmission = useCallback(async (id: string, status: "approved" | "rejected") => {
    setLoading((p) => ({ ...p, [id]: true }));
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setSubmissionStates((p) => ({ ...p, [id]: status }));
    setLoading((p) => ({ ...p, [id]: false }));
  }, []);

  const toggleLocationStatus = useCallback(async (loc: Location) => {
    const current = locationStates[loc.id] ?? loc.status;
    const next = current === "active" ? "inactive" : "active";
    setLoading((p) => ({ ...p, [loc.id]: true }));
    const res = await fetch(`/api/admin/locations/${loc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) setLocationStates((p) => ({ ...p, [loc.id]: next }));
    setLoading((p) => ({ ...p, [loc.id]: false }));
  }, [locationStates]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
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
          <Link href="/" style={{ fontSize: 13, color: "var(--cr-brown-mid)", textDecoration: "none" }}>← View site</Link>
          <button onClick={handleLogout} style={{ fontSize: 13, color: "var(--cr-brown-mid)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Active locations", value: locationCount },
            { label: "Pending submissions", value: pendingCount, highlight: pendingCount > 0 },
            { label: "Total submissions", value: submissions.length },
          ].map(({ label, value, highlight }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: `1px solid ${highlight ? "rgba(194,65,12,0.3)" : "rgba(139,69,19,0.1)"}`, boxShadow: highlight ? "0 0 0 3px rgba(194,65,12,0.08)" : "none" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: highlight ? "#c2410c" : "var(--cr-brown-dark)" }}>{value}</div>
              <div style={{ fontSize: 12, color: "var(--cr-brown-mid)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, background: "rgba(139,69,19,0.07)", borderRadius: 10, padding: 3, marginBottom: 24, width: "fit-content" }}>
          {(["submissions", "locations"] as const).map((t) => (
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
                        {isPending && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => updateSubmission(sub.id, "approved")}
                              disabled={loading[sub.id]}
                              style={{ padding: "6px 16px", fontSize: 12, fontWeight: 600, background: "#15803d", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateSubmission(sub.id, "rejected")}
                              disabled={loading[sub.id]}
                              style={{ padding: "6px 16px", fontSize: 12, fontWeight: 600, background: "#fff", color: "#b91c1c", border: "1.5px solid #b91c1c", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
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

        {/* Locations */}
        {tab === "locations" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {locations.map((loc) => {
              const status = locationStates[loc.id] ?? loc.status;
              const isActive = status === "active";
              return (
                <div key={loc.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", border: "1px solid rgba(139,69,19,0.1)", display: "flex", alignItems: "center", gap: 14, opacity: isActive ? 1 : 0.55 }}>
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
                      onClick={() => toggleLocationStatus(loc)}
                      disabled={loading[loc.id]}
                      style={{ padding: "5px 12px", fontSize: 11, fontWeight: 600, borderRadius: 6, border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", borderColor: isActive ? "rgba(139,69,19,0.25)" : "#15803d", background: isActive ? "#fff" : "#f0fdf4", color: isActive ? "var(--cr-brown-mid)" : "#15803d" }}
                    >
                      {isActive ? "Deactivate" : "Activate"}
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
