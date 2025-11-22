import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// GET stats for a single link
export async function GET(req, { params }) {
  const { code } = params;

  const result = await query(
    "SELECT code, url, clicks, last_clicked, created_at FROM links WHERE code=$1",
    [code]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

// DELETE a link
export async function DELETE(req, { params }) {
  const { code } = params;

  const result = await query(
    "DELETE FROM links WHERE code=$1 RETURNING code",
    [code]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
