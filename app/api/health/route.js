// app/api/health/route.js
import { NextResponse } from "next/server";
import { query } from "../../../lib/db"; 

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
