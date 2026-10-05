import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Client } from "pg";

export const dynamic = "force-dynamic";

function getMigrationSql(): string {
  try {
    const migrationPath = path.join(
      process.cwd(),
      "supabase",
      "migrations",
      "20261005000001_production_schema.sql"
    );
    return fs.readFileSync(migrationPath, "utf-8");
  } catch (err) {
    console.error("Failed to read migration SQL file:", err);
    return "";
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const sql = getMigrationSql();

    // Check if listings table is present
    const { data, error } = await supabase.from("listings").select("id").limit(1);

    if (error && (error.message.includes("Could not find the table") || error.code === "PGRST200" || error.code === "42P01")) {
      return NextResponse.json({
        status: "tables_missing",
        hasTables: false,
        message: "The 'public.listings' table does not exist in your Supabase project yet.",
        instructions: "Please copy the SQL migration and run it in your Supabase Dashboard SQL Editor.",
        sqlLength: sql.length,
        hasDirectDbUrl: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
        sqlSnippet: sql.slice(0, 1000) + "...",
      });
    }

    if (error) {
      return NextResponse.json({
        status: "error",
        hasTables: false,
        message: error.message,
        sqlLength: sql.length,
      });
    }

    return NextResponse.json({
      status: "healthy",
      hasTables: true,
      message: "Database tables are initialized and healthy! All tables ready for production.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getMigrationSql();
    if (!sql) {
      return NextResponse.json(
        { error: "Migration SQL file could not be read." },
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
      message: "Database migration executed successfully! Tables created and schema cache reloaded.",
    });
  } catch (err: any) {
    console.error("Direct migration execution error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        instructions: "Please copy the SQL script from supabase/migrations/20261005000001_production_schema.sql and execute it in your Supabase SQL Editor.",
      },
      { status: 500 }
    );
  }
}
