import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Client } from "pg";

export const dynamic = "force-dynamic";

function getMigrationSql(name: string = "production"): string {
  try {
    const filename =
      name === "news"
        ? "20261007000004_create_news_articles.sql"
        : "20261005000001_production_schema.sql";
    const migrationPath = path.join(process.cwd(), "supabase", "migrations", filename);
    return fs.readFileSync(migrationPath, "utf-8");
  } catch (err) {
    console.error("Failed to read migration SQL file:", err);
    return "";
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const sql = getMigrationSql("production");
    const newsSql = getMigrationSql("news");

    // Check if listings table is present
    const { error: listingsError } = await supabase.from("listings").select("id").limit(1);
    const hasListings = !listingsError;

    // Check if news_articles table is present
    const { error: newsError } = await supabase.from("news_articles").select("id").limit(1);
    const hasNews = !newsError;

    if (!hasListings) {
      return NextResponse.json({
        status: "tables_missing",
        hasTables: false,
        hasListings: false,
        hasNews,
        message: "The 'public.listings' table does not exist in your Supabase project yet.",
        instructions: "Please copy the SQL migration and run it in your Supabase Dashboard SQL Editor.",
        sqlLength: sql.length,
        hasDirectDbUrl: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
        sqlSnippet: sql.slice(0, 1000) + "...",
      });
    }

    return NextResponse.json({
      status: "healthy",
      hasTables: true,
      hasListings: true,
      hasNews,
      message: hasNews
        ? "Database tables are initialized and healthy! All tables ready for production."
        : "Listings ready, but news_articles table is missing. Run the news migration script.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let migrationType = "production";
    try {
      const body = await req.json();
      if (body?.migration) migrationType = body.migration;
    } catch {
      const url = new URL(req.url);
      migrationType = url.searchParams.get("migration") || "production";
    }

    const sql = getMigrationSql(migrationType);
    if (!sql) {
      return NextResponse.json(
        { error: `Migration SQL file for '${migrationType}' could not be read.` },
        { status: 500 }
      );
    }

    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.SUPABASE_DB_URL;

    if (!connectionString) {
      return NextResponse.json({
        success: false,
        status: "manual_migration_required",
        message: "No direct PostgreSQL connection string (DATABASE_URL) found in environment variables. Please run the SQL script directly in your Supabase SQL Editor.",
        sql,
      });
    }

    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    try {
      await client.query(sql);
      // Reload PostgREST schema cache
      try {
        await client.query("NOTIFY pgrst, 'reload schema';");
      } catch {
        // Non-critical
      }
    } finally {
      await client.end();
    }

    return NextResponse.json({
      success: true,
      status: "migrated",
      message: `Database migration '${migrationType}' executed successfully! Tables created and schema cache reloaded.`,
    });
  } catch (err: any) {
    console.error("Direct migration execution error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        instructions: "Please copy the SQL script from supabase/migrations and execute it in your Supabase SQL Editor.",
      },
      { status: 500 }
    );
  }
}
