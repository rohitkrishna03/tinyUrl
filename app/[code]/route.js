// app/[code]/route.js
import { NextResponse } from "next/server";
import { query } from "../../lib/db";

export async function GET(req, { params }) {
  const { code } = params;

  const result = await query(
    "SELECT url FROM links WHERE code=$1",
    [code]
  );

  if (result.rowCount === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const url = result.rows[0].url;


  await query(
  "UPDATE links SET clicks = clicks + 1, last_clicked = NOW() AT TIME ZONE 'Asia/Kolkata' WHERE code=$1",
  [code]
);


  return NextResponse.redirect(url, 302);
}
