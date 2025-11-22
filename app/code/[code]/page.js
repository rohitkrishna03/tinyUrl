
// // Build absolute base URL that works in SSR + Browser
// function getBaseUrl() {
//   if (typeof window !== "undefined") {
//     return window.location.origin;
//   }
//   return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
// }

// // Same formatter logic as dashboard
// // DB is effectively storing IST-like timestamp without timezone,
// // and JS is treating it as UTC, so we force timeZone: 'UTC'
// // to read the stored clock time as-is.
// function formatIST(dateString) {
//   if (!dateString) return "—";

//   const d = new Date(dateString);
//   if (isNaN(d)) return "—";

//   return d.toLocaleString("en-IN", {
//     timeZone: "UTC",
//     hour12: true,
//   });
// }

// async function fetchStats(code) {
//   const base = getBaseUrl();

//   const res = await fetch(`${base}/api/links/${code}`, {
//     cache: "no-store",
//   });

//   return res.json();
// }

// export default async function StatsPage({ params }) {
//   const { code } = params;

//   const data = await fetchStats(code);
//   const base = getBaseUrl();
//   const shortUrl = `${base}/${code}`;

//   if (data.error) {
//     return (
//       <div className="p-10 text-red-400">
//         Link not found
//       </div>
//     );
//   }

//   return (
//     <div className="p-10 space-y-6">

//       <h1 className="text-2xl font-semibold text-white">
//         Stats for {code}
//       </h1>

//       <div className="grid gap-4 md:grid-cols-2">
//         {/* Short URL */}
//         <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
//           <div className="text-xs text-slate-400">Short URL</div>
//           <div className="mt-1 text-emerald-300 font-mono">
//             {shortUrl}
//           </div>
//         </div>

//         {/* Destination URL */}
//         <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
//           <div className="text-xs text-slate-400">Destination URL</div>
//           <div className="mt-1 text-slate-300 break-all">
//             {data.url}
//           </div>
//         </div>

//         {/* Clicks */}
//         <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
//           <div className="text-xs text-slate-400">Clicks</div>
//           <div className="mt-2 text-3xl text-emerald-300">
//             {data.clicks}
//           </div>
//         </div>

//         {/* Last Clicked */}
//         <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
//           <div className="text-xs text-slate-400">Last Clicked</div>
//           <div className="mt-1 text-slate-300">
//             {data.last_clicked ? formatIST(data.last_clicked) : "Never"}
//           </div>
//         </div>

//         {/* Created At */}
//         <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:col-span-2">
//           <div className="text-xs text-slate-400">Created At</div>
//           <div className="mt-1 text-slate-300">
//             {data.created_at ? formatIST(data.created_at) : "—"}
//           </div>
//         </div>
//       </div>

//       {/* Visit short URL */}
//       <a
//         href={`/${code}`}
//         className="inline-block px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded"
//       >
//         Visit Short URL
//       </a>

//     </div>
//   );
// }



// app/code/[code]/page.js

// 1. Base URL helper: works in browser, Vercel server, and local dev
function getBaseUrl() {
  // Browser (client side)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Vercel server (production / preview)
  if (process.env.VERCEL_URL) {
    // Vercel gives something like "my-app.vercel.app"
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local dev server (next dev)
  return "http://localhost:3000";
}

// 2. Time formatting for IST (we already fixed this logic elsewhere)
function formatIST(dateString) {
  if (!dateString) return "Never";

  const d = new Date(dateString);
  if (isNaN(d)) return "Never";

  // Our DB stores "clock time" in IST, but JS treats it like UTC.
  // So we tell JS: "show it as-is, don't shift time zone".
  return d.toLocaleString("en-IN", {
    timeZone: "UTC",
    hour12: true,
  });
}

// 3. Fetch stats for a single code
async function fetchStats(code) {
  const base = getBaseUrl();

  const res = await fetch(`${base}/api/links/${code}`, {
    cache: "no-store",
  });

  return res.json();
}

// 4. Stats page component (server component)
export default async function StatsPage({ params }) {
  const { code } = params;

  const data = await fetchStats(code);
  const base = getBaseUrl();
  const shortUrl = `${base}/${code}`;

  if (data.error) {
    return (
      <div className="p-10 text-red-400">
        Link not found
      </div>
    );
  }

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-semibold text-white">
        Stats for {code}
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Short URL */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Short URL</div>
          <div className="mt-1 text-emerald-300 font-mono">
            {shortUrl}
          </div>
        </div>

        {/* Destination URL */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Destination URL</div>
          <div className="mt-1 text-slate-300 break-all">
            {data.url}
          </div>
        </div>

        {/* Clicks */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Clicks</div>
          <div className="mt-2 text-3xl text-emerald-300">
            {data.clicks}
          </div>
        </div>

        {/* Last Clicked */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Last Clicked</div>
          <div className="mt-1 text-slate-300">
            {formatIST(data.last_clicked)}
          </div>
        </div>
      </div>

      {/* Visit short URL */}
      <a
        href={`/${code}`}
        className="inline-block px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded"
      >
        Visit Short URL
      </a>
    </div>
  );
}
