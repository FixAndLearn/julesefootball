"use client";

import { Button } from "@/components/ui/Button";
import {
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Terminal,
  AlertCircle,
  Play,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SetupPage() {
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const checkStatus = async () => {
    setLoading(true);
    setActionMessage("");
    try {
      const res = await fetch("/api/setup-database");
      const data = await res.json();
      setStatusData(data);
    } catch (err: any) {
      setStatusData({ status: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleCopySql = async () => {
    setCopyError("");
    try {
      const res = await fetch("/api/setup-database/sql");
      const sql = await res.text();
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch (err: any) {
      setCopyError("Could not copy automatically. You can find the file at supabase/migrations/20261005000001_production_schema.sql");
    }
  };

  const handleRunAutoMigration = async () => {
    setMigrating(true);
    setActionMessage("");
    try {
      const res = await fetch("/api/setup-database", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setActionMessage("Success: " + data.message);
        await checkStatus();
      } else {
        setActionMessage(data.message || data.error || "Migration could not be executed directly.");
      }
    } catch (err: any) {
      setActionMessage("Error: " + err.message);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
          <Database className="w-3.5 h-3.5" />
          <span>Supabase Infrastructure Center</span>
        </div>
        <h1 className="text-3xl font-bold text-white font-display">
          Database Schema & Table Setup
        </h1>
        <p className="text-sm text-slate-400">
          Verify and provision the eFootballMarket PostgreSQL database tables, triggers, and Row Level Security policies.
        </p>
      </div>

      {/* Live Table Health Card */}
      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-pitch-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pitch-card border border-pitch-border flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Database Table Status</h2>
              <p className="text-xs text-slate-400">Live check against &apos;public.listings&apos; table</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={checkStatus}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Recheck Tables
          </Button>
        </div>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs text-slate-400">Querying Supabase database schema cache...</p>
          </div>
        ) : statusData?.hasTables ? (
          <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-200">Database Healthy & Ready!</p>
              <p className="text-xs text-emerald-300/90 mt-0.5">
                The &apos;public.listings&apos; table and schema are present. You can list accounts, process escrow orders, and accept M-Pesa payments.
              </p>
              <div className="pt-3">
                <Link href="/seller/create-listing">
                  <Button variant="gold" size="sm" className="font-semibold text-xs">
                    Create eFootball Listing Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-200">Database Tables Need Initialization</p>
              <p className="text-xs text-rose-300/90 mt-0.5">
                The &apos;public.listings&apos; table was not found in your Supabase schema cache. Follow the 1-step guide below to execute the database migration.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 1-Step Setup Guide */}
      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-6">
        <div className="border-b border-pitch-border/60 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>How to Initialize Your Supabase Database in 30 Seconds</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Execute the complete production schema script in your Supabase Dashboard SQL Editor.
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-pitch-card border border-pitch-border">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs font-semibold text-slate-100">
                Copy the Production Database Migration SQL
              </p>
              <p className="text-[11px] text-slate-400">
                Contains all 13 tables: listings, profiles, orders, escrow accounts, M-Pesa transactions, triggers, and Row Level Security policies.
              </p>
              <div className="pt-1 flex items-center gap-3">
                <Button
                  type="button"
                  variant="gold"
                  size="sm"
                  onClick={handleCopySql}
                  className="font-semibold text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-slate-950" />
                      Copied 828 Lines to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      Copy Schema SQL to Clipboard
                    </>
                  )}
                </Button>
                {copyError && <span className="text-[11px] text-rose-400">{copyError}</span>}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-pitch-card border border-pitch-border">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs font-semibold text-slate-100">
                Open Your Supabase Dashboard SQL Editor
              </p>
              <p className="text-[11px] text-slate-400">
                In your Supabase project dashboard, click the SQL Editor tab (the &apos;&gt;_&apos; icon on the left sidebar) and click &quot;New query&quot;.
              </p>
              <div className="pt-1">
                <a
                  href="https://supabase.com/dashboard/project/_/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="sm" className="text-xs">
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                    Open Supabase SQL Editor
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-pitch-card border border-pitch-border">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-semibold text-slate-100">Paste and Click &quot;Run&quot;</p>
              <p className="text-[11px] text-slate-400">
                Paste the copied SQL into the editor window and click the green &quot;Run&quot; button. Supabase will create all tables in approximately 2 seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Automated Migration Section */}
        {statusData?.hasDirectDbUrl && (
          <div className="p-4 rounded-xl bg-pitch-card/60 border border-pitch-border space-y-2">
            <p className="text-xs font-bold text-slate-200">Automated Direct Migration (Detected DATABASE_URL)</p>
            <p className="text-[11px] text-slate-400">
              A PostgreSQL connection string was detected in your environment. You can click below to execute the migration automatically.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRunAutoMigration}
              disabled={migrating}
              className="text-xs font-semibold mt-1"
            >
              {migrating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Running automated migration...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1.5 text-emerald-400 fill-emerald-400" />
                  Run Automated Database Migration
                </>
              )}
            </Button>
            {actionMessage && (
              <p className="text-xs text-amber-300 pt-1 font-mono">{actionMessage}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
