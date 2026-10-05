import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const migrationPath = path.join(
      process.cwd(),
      "supabase",
      "migrations",
      "20261005000001_production_schema.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf-8");

    return new NextResponse(sql, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'inline; filename="20261005000001_production_schema.sql"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
