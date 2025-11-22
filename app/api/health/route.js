// // app/api/health/route.js

// import { NextResponse } from "next/server";
// import { query } from "../../../lib/db";

// function formatUptime(seconds) {
//   const s = Math.floor(seconds);
//   const h = Math.floor(s / 3600);
//   const m = Math.floor((s % 3600) / 60);
//   const sec = s % 60;

//   if (h > 0) return `${h}h ${m}m ${sec}s`;
//   if (m > 0) return `${m}m ${sec}s`;
//   return `${sec}s`;
// }

// export async function GET() {
//   const start = Date.now();
//   const uptimeSeconds = process.uptime();
//   let dbStatus = "ok";

//   try {
//     await query("SELECT 1"); // DB heartbeat test
//   } catch (e) {
//     console.error("DB CHECK FAILED:", e);
//     dbStatus = "error";
//   }

//   const responseTime = Date.now() - start;

//   return NextResponse.json({
//     api_status: "ok",
//     db_status: dbStatus,
//     uptime_seconds: uptimeSeconds,
//     uptime_human: formatUptime(uptimeSeconds),
//     response_time_ms: responseTime,
//     checked_at: new Date().toISOString(),
//   });
// }
// app/api/health/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db"; // or "../../../lib/db" if you don't use @

const startTime = Date.now();

export async function GET() {
  let dbStatus = "ok";

  try {
    await query("SELECT 1", []);
  } catch (err) {
    console.error("DB health check failed:", err);
    dbStatus = "error";
  }

  const uptimeMs = Date.now() - startTime;

  return NextResponse.json({
    db_status: dbStatus,
    api_status: "ok",
    uptime_ms: uptimeMs,
    uptime_human: `${Math.floor(uptimeMs / 1000)}s`,
    response_time_ms: 1,
  });
}
