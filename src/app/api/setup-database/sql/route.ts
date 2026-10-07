import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const migration = url.searchParams.get("migration");

    let filename = "20261005000001_production_schema.sql";
    if (migration === "news") {
      filename = "20261007000004_create_news_articles.sql";
    }

    const migrationPath = path.join(
      process.cwd(),
      "supabase",
      "migrations",
      filename
    );
    const sql = fs.readFileSync(migrationPath, "utf-8");

    return new NextResponse(sql, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
