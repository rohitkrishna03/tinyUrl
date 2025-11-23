// app/page.js
'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

/* -------------------------------------------------------
   Helper: Format timestamp coming from DB
   DB now stores IST-like timestamp, but JS treats it as UTC,
   so we force timeZone: 'UTC' to read raw clock time as-is.
--------------------------------------------------------*/
function formatIST(dateString) {
  if (!dateString) return '—';

  const d = new Date(dateString);
  if (isNaN(d)) return '—';

  return d.toLocaleString('en-IN', {
    timeZone: 'UTC',   // 🔑 important for your current DB setup
    hour12: true,
  });
}

export default function DashboardPage() {
  const [linksCount, setLinksCount] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [recentLinks, setRecentLinks] = useState([]);

  const [urlInput, setUrlInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [deleteError, setDeleteError] = useState("");

  const [search, setSearch] = useState("");

  /* -------------------------------------------------------
     Initial Load + Auto Refresh Every 8 Seconds
  --------------------------------------------------------*/
  useEffect(() => {
    loadLinks();

    const interval = setInterval(() => {
      loadLinks();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  /* -------------------------------------------------------
     Fetch all links — ALWAYS no-store to avoid stale time
  --------------------------------------------------------*/
  async function loadLinks() {
    try {
      const res = await fetch("/api/links", { cache: "no-store" });
      const data = await res.json();

      const links = Array.isArray(data) ? data : data.links || [];

      setRecentLinks(links);
      setLinksCount(links.length);
      setTotalClicks(links.reduce((sum, l) => sum + (l.clicks || 0), 0));
    } catch (err) {
      console.error("Error loading links:", err);
    }
  }

  /* -------------------------------------------------------
     Create short link
  --------------------------------------------------------*/
  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!urlInput.trim()) {
      setFormError("Please enter a destination URL");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urlInput.trim(),
          code: codeInput.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data?.error || "Failed to create short link");
      } else {
        setFormSuccess(`Short link created: ${data.code}`);
        setUrlInput("");
        setCodeInput("");
        loadLinks();
      }
    } finally {
      setSubmitting(false);
    }
  }

  /* -------------------------------------------------------
     Delete link
  --------------------------------------------------------*/
  async function handleDelete(code) {
    setDeleteError("");

    if (!confirm(`Delete link "${code}"?`)) return;

    try {
      const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data?.error || "Failed to delete link");
      } else {
        loadLinks();
      }
    } catch (err) {
      setDeleteError("Unexpected error deleting link");
    }
  }

  /* -------------------------------------------------------
     Short URL helper
  --------------------------------------------------------*/
  function getShortUrl(code) {
    if (typeof window === "undefined") return code;
    return `${window.location.origin}/${code}`;
  }

  /* -------------------------------------------------------
     Search filter
  --------------------------------------------------------*/
  const filteredLinks = recentLinks.filter((link) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      link.code.toLowerCase().includes(q) ||
      link.url.toLowerCase().includes(q)
    );
  });

  /* -------------------------------------------------------
     Most clicked link for stats card
  --------------------------------------------------------*/
  const mostClicked =
    recentLinks.length > 0
      ? recentLinks.reduce(
          (max, l) => ((l.clicks || 0) > (max.clicks || 0) ? l : max),
          recentLinks[0]
        )
      : null;

  /* -------------------------------------------------------
     Render UI
  --------------------------------------------------------*/
  return (
    <div className="min-h-screen flex">

      {/* Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-950/90 px-5 py-6">
        <div className="mb-8">
          <div className="text-xl font-semibold">TinyUrl</div>
          <div className="text-xs text-slate-400">Admin Dashboard</div>
        </div>

        <nav className="space-y-2 text-sm">
          <Link href="/" className="block">
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg">
              Dashboard
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20">
                Active
              </span>
            </div>
          </Link>

          <Link href="/health" className="block">
            <div className="px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-300">
              Health
            </div>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-8 py-6 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Monitor your TinyUrl links and clicks.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total Links" value={linksCount} />
          <StatCard label="Total Clicks" value={totalClicks} />

          <StatCard
            label="System Health"
            value="Healthy"
            color="text-emerald-300"
          />

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-xs text-slate-400">Top Link</div>
            {mostClicked ? (
              <>
                <div className="mt-2 text-sm font-mono text-emerald-300">
                  {mostClicked.code} ({mostClicked.clicks} clicks)
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {mostClicked.url}
                </div>
              </>
            ) : (
              <div className="mt-2 text-sm text-slate-500">No links yet.</div>
            )}
          </div>
        </div>

        {/* Form + panel */}
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          {/* Create link form */}
          <CreateLinkForm
            urlInput={urlInput}
            codeInput={codeInput}
            submitting={submitting}
            formError={formError}
            formSuccess={formSuccess}
            setUrlInput={setUrlInput}
            setCodeInput={setCodeInput}
            handleSubmit={handleSubmit}
          />

          {/* Health summary */}
          <HealthSummary />
        </div>

        {/* Delete error */}
        {deleteError && (
          <div className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-red-200 text-xs">
            {deleteError}
          </div>
        )}

        {/* Recent links table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Recent Links
            </h2>

            <div className="flex gap-3 items-center">
              <input
                className="w-56 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button
                onClick={loadLinks}
                className="px-3 py-1.5 rounded-md border border-slate-600 text-xs hover:bg-slate-700/60"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="max-h-72 overflow-y-auto border border-slate-800/60 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 sticky top-0 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Code</th>
                  <th className="py-2 px-3">Short URL</th>
                  <th className="py-2 px-3">Destination</th>
                  <th className="py-2 px-3 text-right">Clicks</th>
                  <th className="py-2 px-3 text-right">Created At</th>
                  <th className="py-2 px-3 text-right">Last Clicked</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredLinks.map((link) => (
                  <tr key={link.code}>
                    <td className="py-2 px-3 text-emerald-300 font-mono">
                      {link.code}
                    </td>

                    <td className="py-2 px-3 text-sky-300 truncate max-w-[150px]">
                      {getShortUrl(link.code)}
                    </td>

                    <td className="py-2 px-3 text-slate-200 truncate max-w-xs">
                      {link.url}
                    </td>

                    <td className="py-2 px-3 text-right">
                      {link.clicks ?? 0}
                    </td>

                    {/* 🔹 Created At using same formatter */}
                    <td className="py-2 px-3 text-right text-slate-400">
                      {link.created_at ? formatIST(link.created_at) : "—"}
                    </td>

                    {/* 🔹 Last Clicked using same formatter */}
                    <td className="py-2 px-3 text-right text-slate-400">
                      {link.last_clicked
                        ? formatIST(link.last_clicked)
                        : "—"}
                    </td>

                    <td className="py-2 px-3 text-right">
                      <div className="flex gap-2 justify-end">
                        {/* <Link href={`/code/${link.code}`}>
                          <button className="px-2 py-1 border border-slate-600 rounded-md hover:bg-slate-700/60">
                            Stats
                          </button>
                        </Link> */}
                        <Link href={`/stats/${link.code}`}>
  <button className="px-2 py-1 border border-slate-600 rounded-md hover:bg-slate-700/60">
    Stats
  </button>
</Link>



                        <button
                          onClick={() => handleDelete(link.code)}
                          className="px-2 py-1 border border-red-500/60 text-red-200 rounded-md hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredLinks.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-4 text-center text-slate-500"
                    >
                      No links found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   Small Reusable Components
--------------------------------------------------------*/

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`mt-2 text-3xl font-semibold ${color || "text-emerald-300"}`}>
        {value}
      </div>
    </div>
  );
}

function CreateLinkForm({
  urlInput,
  codeInput,
  setUrlInput,
  setCodeInput,
  submitting,
  formError,
  formSuccess,
  handleSubmit,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <h2 className="text-sm font-semibold text-slate-100">
        Create short link
      </h2>

      {formError && (
        <div className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-red-200 text-xs">
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-emerald-200 text-xs">
          {formSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="space-y-1">
          <label className="text-slate-300">Destination URL</label>
          <input
            type="url"
            required
            placeholder="https://example.com/"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-300">Custom code (optional)</label>
          <input
            type="text"
            placeholder="e.g. mylink123"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-md text-slate-950 text-xs font-medium"
        >
          {submitting ? "Creating..." : "Create Short Link"}
        </button>
      </form>
    </div>
  );
}

function HealthSummary() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400">
      <h2 className="text-sm font-semibold text-slate-100 mb-1">
        Health Summary
      </h2>

      <div className="flex items-center justify-between">
        <span>Database (Neon)</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-emerald-200">Online</span>
        </span>
      </div>

      <div className="flex items-center justify-between mt-2">
        <span>API Routes</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-emerald-200">Healthy</span>
        </span>
      </div>

      <p className="mt-3 text-[11px]">
        These values are static for now — real systems would show live metrics.
      </p>
    </div>
  );
}
