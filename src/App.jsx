import { useState, useEffect, useCallback } from "react";

const API_URL = "https://api.freeapi.app/api/v1/public/randomusers?limit=12&page=1";

const GENDER_COLORS = {
  male: { bg: "#0f172a", accent: "#38bdf8", tag: "#0ea5e9" },
  female: { bg: "#1e0a2e", accent: "#e879f9", tag: "#d946ef" },
  default: { bg: "#0f1a10", accent: "#4ade80", tag: "#22c55e" },
};

function SkeletonCard() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20,
      padding: 28,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      animation: "pulse 1.5s ease-in-out infinite",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 14, borderRadius: 6, background: "rgba(255,255,255,0.08)", width: "70%" }} />
          <div style={{ height: 11, borderRadius: 6, background: "rgba(255,255,255,0.05)", width: "45%" }} />
        </div>
      </div>
      {[80, 65, 90].map((w, i) => (
        <div key={i} style={{ height: 11, borderRadius: 6, background: "rgba(255,255,255,0.06)", width: `${w}%` }} />
      ))}
    </div>
  );
}

function UserCard({ user, onClick }) {
  const gender = user?.gender?.toLowerCase() || "default";
  const colors = GENDER_COLORS[gender] || GENDER_COLORS.default;
  const name = user?.name ? `${user.name.first} ${user.name.last}` : "Unknown";
  const location = user?.location ? `${user.location.city}, ${user.location.country}` : "—";
  const age = user?.dob?.age ?? "—";
  const email = user?.email ?? "—";
  const phone = user?.phone ?? "—";
  const picture = user?.picture?.medium;
  const nat = user?.nat ?? "";

  return (
    <div
      onClick={() => onClick(user)}
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 20,
        padding: 24,
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px ${colors.accent}44`;
        e.currentTarget.style.borderColor = `${colors.accent}55`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: "absolute", top: -30, right: -30, width: 100, height: 100,
        borderRadius: "50%", background: colors.accent, opacity: 0.08, filter: "blur(30px)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <img
            src={picture}
            alt={name}
            style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: `2px solid ${colors.accent}66` }}
            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`; }}
          />
          <div style={{
            position: "absolute", bottom: 0, right: 0, width: 16, height: 16,
            borderRadius: "50%", background: colors.tag,
            border: "2px solid #0a0a0f",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 8, color: "#fff", fontWeight: 700,
          }}>{nat}</div>
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: "#f1f5f9", lineHeight: 1.2 }}>{name}</div>
          <div style={{
            marginTop: 4, display: "inline-block", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.06em", textTransform: "uppercase",
            background: `${colors.accent}22`, color: colors.accent,
            padding: "2px 8px", borderRadius: 20,
          }}>{gender} · {age} yrs</div>
        </div>
      </div>

      {/* Info rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
        <InfoRow icon="📍" label={location} color="#94a3b8" />
        <InfoRow icon="✉️" label={email} color="#94a3b8" truncate />
        <InfoRow icon="📞" label={phone} color="#94a3b8" />
      </div>

      {/* Footer */}
      <div style={{
        paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)",
        fontSize: 11, color: "#475569", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontFamily: "monospace" }}>@{user?.login?.username ?? "—"}</span>
        <span style={{ color: colors.accent, fontWeight: 600 }}>View Profile →</span>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, color, truncate }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, color }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{
        overflow: truncate ? "hidden" : undefined,
        textOverflow: truncate ? "ellipsis" : undefined,
        whiteSpace: truncate ? "nowrap" : undefined,
        maxWidth: truncate ? 180 : undefined,
      }}>{label}</span>
    </div>
  );
}

function Modal({ user, onClose }) {
  if (!user) return null;
  const gender = user?.gender?.toLowerCase() || "default";
  const colors = GENDER_COLORS[gender] || GENDER_COLORS.default;
  const name = `${user.name.first} ${user.name.last}`;
  const dob = user?.dob?.date ? new Date(user.dob.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—";
  const registered = user?.registered?.date ? new Date(user.registered.date).toLocaleDateString("en-IN", { year: "numeric", month: "short" }) : "—";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        padding: 16, animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0e0e16", border: `1px solid ${colors.accent}44`,
          borderRadius: 28, padding: 36, maxWidth: 480, width: "100%",
          position: "relative", boxShadow: `0 0 60px ${colors.accent}22`,
          animation: "slideUp 0.25s ease",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.08)", border: "none",
            borderRadius: "50%", width: 32, height: 32, cursor: "pointer",
            color: "#94a3b8", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >✕</button>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", marginBottom: 28 }}>
          <img
            src={user.picture.large}
            alt={name}
            style={{ width: 100, height: 100, borderRadius: "50%", border: `3px solid ${colors.accent}`, objectFit: "cover" }}
          />
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#f1f5f9" }}>{name}</div>
            <div style={{ color: colors.accent, fontSize: 13, marginTop: 4 }}>@{user.login?.username}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Email", value: user.email, icon: "✉️" },
            { label: "Phone", value: user.phone, icon: "📞" },
            { label: "Cell", value: user.cell, icon: "📱" },
            { label: "Gender", value: user.gender, icon: "👤" },
            { label: "Date of Birth", value: dob, icon: "🎂" },
            { label: "Age", value: `${user.dob?.age} years`, icon: "⏳" },
            { label: "City", value: user.location?.city, icon: "🏙️" },
            { label: "Country", value: user.location?.country, icon: "🌍" },
            { label: "State", value: user.location?.state, icon: "📌" },
            { label: "Postcode", value: user.location?.postcode, icon: "🏷️" },
            { label: "Nationality", value: user.nat, icon: "🏳️" },
            { label: "Registered", value: registered, icon: "📅" },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 14px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                {icon} {label}
              </div>
              <div style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 500, wordBreak: "break-all" }}>{value ?? "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterGender, setFilterGender] = useState("all");

  const fetchUsers = useCallback(async (pg = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.freeapi.app/api/v1/public/randomusers?limit=12&page=${pg}`);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const json = await res.json();
      const data = json?.data;
      setUsers(data?.data ?? []);
      setTotalPages(data?.totalPages ?? 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(page); }, [page, fetchUsers]);

  const filtered = users.filter(u => {
    const name = `${u.name?.first} ${u.name?.last}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.location?.country?.toLowerCase().includes(search.toLowerCase());
    const matchGender = filterGender === "all" || u.gender?.toLowerCase() === filterGender;
    return matchSearch && matchGender;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#08080f",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#f1f5f9",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        ::-webkit-scrollbar{width:6px;background:#08080f}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px}
        input::placeholder{color:#334155}
      `}</style>

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <div style={{
            display: "inline-block", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#38bdf8", fontWeight: 600, marginBottom: 12,
            background: "rgba(56,189,248,0.1)", padding: "4px 14px", borderRadius: 20,
          }}>Random Users API</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 900, lineHeight: 1.05,
            background: "linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>People of the World</h1>
          <p style={{ marginTop: 12, color: "#475569", fontSize: 15 }}>
            Discover {users.length} randomly generated profiles
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, country…"
              style={{
                width: "100%", padding: "12px 14px 12px 40px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, color: "#f1f5f9", fontSize: 14, outline: "none",
              }}
            />
          </div>
          {["all", "male", "female"].map(g => (
            <button
              key={g}
              onClick={() => setFilterGender(g)}
              style={{
                padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                background: filterGender === g ? (g === "male" ? "#0ea5e9" : g === "female" ? "#d946ef" : "#38bdf8") : "rgba(255,255,255,0.06)",
                color: filterGender === g ? "#fff" : "#64748b",
                transition: "all 0.2s",
              }}
            >{g.charAt(0).toUpperCase() + g.slice(1)}</button>
          ))}
          <button
            onClick={() => fetchUsers(page)}
            style={{
              padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent", color: "#94a3b8", cursor: "pointer",
              fontSize: 13, fontFamily: "inherit", fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#f1f5f9"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
          >⟳ Refresh</button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 12, padding: 20, marginBottom: 24, color: "#fca5a5", fontSize: 14,
          }}>
            ⚠️ Failed to load: {error}
            <button onClick={() => fetchUsers(page)} style={{ marginLeft: 12, color: "#f87171", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Retry</button>
          </div>
        )}

        {/* Results count */}
        {!loading && !error && (
          <div style={{ marginBottom: 20, fontSize: 13, color: "#475569" }}>
            Showing <span style={{ color: "#94a3b8", fontWeight: 600 }}>{filtered.length}</span> of {users.length} users
            {search && <> matching "<span style={{ color: "#38bdf8" }}>{search}</span>"</>}
          </div>
        )}

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 40,
        }}>
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length > 0
              ? filtered.map((user, i) => (
                  <div key={user.login?.uuid ?? i} style={{ animation: `slideUp 0.3s ease ${i * 0.04}s both` }}>
                    <UserCard user={user} onClick={setSelectedUser} />
                  </div>
                ))
              : (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#334155" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🌐</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>No users found</div>
                  <div style={{ fontSize: 14, marginTop: 6 }}>Try a different search or filter</div>
                </div>
              )
          }
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{
                padding: "10px 20px", borderRadius: 10,
                background: page === 1 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.08)", color: page === 1 ? "#1e293b" : "#94a3b8",
                cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 13, fontFamily: "inherit",
              }}
            >← Prev</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 40, height: 40, borderRadius: 10, border: "none",
                  background: page === p ? "#38bdf8" : "rgba(255,255,255,0.06)",
                  color: page === p ? "#0a0a0f" : "#64748b",
                  cursor: "pointer", fontWeight: page === p ? 700 : 400, fontSize: 14, fontFamily: "inherit",
                }}
              >{p}</button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{
                padding: "10px 20px", borderRadius: 10,
                background: page === totalPages ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.08)", color: page === totalPages ? "#1e293b" : "#94a3b8",
                cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 13, fontFamily: "inherit",
              }}
            >Next →</button>
          </div>
        )}
      </div>

      {selectedUser && <Modal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}
