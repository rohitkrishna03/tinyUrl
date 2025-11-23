// app/api/links/route.js
import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { isValidCode, generateCode, validateUrl } from "../../../lib/utils";

export async function GET() {
  const result = await query(
    "SELECT code, url, clicks, last_clicked, created_at FROM links ORDER BY created_at DESC"
  );
  return NextResponse.json(result.rows);
}

export async function POST(req) {
  const body = await req.json();
  const { url, code: customCode } = body;

  if (!validateUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  let code = customCode;

  if (code) {
    if (!isValidCode(code)) {
      return NextResponse.json(
        { error: "Invalid code. Must match [A-Za-z0-9]{6,8}." },
        { status: 400 }
      );
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const generated = generateCode(6);
      const exists = await query("SELECT 1 FROM links WHERE code=$1", [generated]);
      if (exists.rowCount === 0) {
        code = generated;
        break;
      }
    }
    if (!code) {
      return NextResponse.json(
        { error: "Failed to generate code" },
        { status: 500 }
      );
    }
  }

  const duplicate = await query("SELECT 1 FROM links WHERE code=$1", [code]);
  if (duplicate.rowCount > 0) {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }

  await query("INSERT INTO links (code, url) VALUES ($1, $2)", [code, url]);

  return NextResponse.json({ code, url }, { status: 201 });
}
