// app/healthz/route.js
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "tinylink",
    version: "1.0",
  });
}
