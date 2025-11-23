
// // app/code/[code]/page.js
// import { query } from "../../../lib/db";

// // Make sure this page is always rendered on the server at request time
// export const dynamic = "force-dynamic";

// // Format timestamp in IST (same logic as dashboard)
// function formatIST(dateString) {
//   if (!dateString) return "Never";

//   const d = new Date(dateString);
//   if (isNaN(d)) return "Never";

//   // DB holds IST “clock time”, JS treats it like UTC,
//   // so we force display in UTC to avoid double shifting.
//   return d.toLocaleString("en-IN", {
//     timeZone: "UTC",
//     hour12: true,
//   });
// }

// // Build the visible "short URL" string (no network calls)
// function getShortBase() {
//   // you can set this in Vercel as NEXT_PUBLIC_BASE_URL if you want
//   if (process.env.NEXT_PUBLIC_BASE_URL) {
//     return process.env.NEXT_PUBLIC_BASE_URL;
//   }
//   if (process.env.VERCEL_URL) {
//     return `https://${process.env.VERCEL_URL}`;
//   }
//   // local dev fallback string – just a string, NOT used in fetch
//   return "http://localhost:3000";
// }

// export default async function StatsPage({ params }) {
//   const { code } = params;

//   // 🔹 Query Neon DB directly – no fetch, no localhost
//   const result = await query(
//     "SELECT code, url, clicks, last_clicked, created_at FROM links WHERE code = $1",
//     [code]
//   );

//   if (result.rowCount === 0) {
//     return (
//       <div className="p-10 text-red-400">
//         Link not found
//       </div>
//     );
//   }

//   const data = result.rows[0];
//   const shortUrl = `${getShortBase()}/${data.code}`;

//   return (
//     <div className="p-10 space-y-6">
//       <h1 className="text-2xl font-semibold text-white">
//         Stats for {data.code}
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
//             {data.clicks ?? 0}
//           </div>
//         </div>

//         {/* Last Clicked */}
//         <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
//           <div className="text-xs text-slate-400">Last Clicked</div>
//           <div className="mt-1 text-slate-300">
//             {formatIST(data.last_clicked)}
//           </div>
//         </div>
//       </div>

//       {/* Visit short URL */}
//       <a
//         href={`/${data.code}`}
//         className="inline-block px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded"
//       >
//         Visit Short URL
//       </a>
//     </div>
//   );
// }
