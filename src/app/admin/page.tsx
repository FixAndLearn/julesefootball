"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { isSuperAdminEmail, isUserAdmin, PRIMARY_SUPER_ADMIN_EMAIL } from "@/lib/security/adminAuth";
import { formatCurrency } from "@/lib/utils";
import { Listing, NewsArticle, NewsCategory } from "@/types/database";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Eye,
  FileText,
  KeyRound,
  Layers,
  Lock,
  Newspaper,
  PlusCircle,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";

function AdminControlCenterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"listings" | "users" | "news" | "withdrawals">(
    (searchParams.get("tab") as any) || "listings"
  );

  // Data states
  const [listings, setListings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Search filters
  const [listingSearch, setListingSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [withdrawalSearch, setWithdrawalSearch] = useState("");
  const [withdrawalFilter, setWithdrawalFilter] = useState<"all" | "pending" | "completed" | "rejected">("pending");
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Post News Form state
  const [newsTitle, setNewsTitle] = useState("");
  const [newsCategory, setNewsCategory] = useState<NewsCategory>("scammer_alert");
  const [newsSummary, setNewsSummary] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsCoverImage, setNewsCoverImage] = useState("");
  const [broadcastNotif, setBroadcastNotif] = useState(true);

  // Modal for Takedown Reason
  const [takedownTarget, setTakedownTarget] = useState<any | null>(null);
  const [takedownReason, setTakedownReason] = useState("");

  // Modal for Withdrawal Rejection
  const [rejectModalTarget, setRejectModalTarget] = useState<any | null>(null);
  const [rejectModalReason, setRejectModalReason] = useState("");

  const isSuperAdmin = isSuperAdminEmail(user?.email);
  const isAdmin = isUserAdmin(user?.email, profile?.role);

  // Auth gate check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/admin");
    }
  }, [authLoading, isAuthenticated, router]);

  const loadAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setFeedback(null);

    try {
      // 1. Load Listings
      const listingsRes = await fetch("/api/admin/listings");
      if (listingsRes.ok) {
        const data = await listingsRes.json();
        setListings(data.listings || []);
      }

      // 2. Load Users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      // 3. Load News Articles
      const newsRes = await fetch("/api/news");
      if (newsRes.ok) {
        const data = await newsRes.json();
        setArticles(data.articles || []);
      }

      // 4. Load Withdrawals
      const withdrawalsRes = await fetch("/api/admin/withdrawals");
      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch (err: any) {
      console.warn("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, loadAdminData]);

  // Handle Listing Takedown / Reinstate
  const handleModerateListing = async (listingId: string, action: "take_down" | "reinstate", reason?: string) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, action, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to moderate listing");

      setFeedback({ type: "success", message: data.message || "Listing updated." });
      setTakedownTarget(null);
      setTakedownReason("");
      loadAdminData();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle User Privilege / Ban Actions
  const handleUserAction = async (targetUserId: string, action: "grant_admin" | "dismiss_admin" | "ban_user" | "unban_user") => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to execute action");

      setFeedback({ type: "success", message: data.message });
      loadAdminData();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create News
  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newsTitle,
          category: newsCategory,
          summary: newsSummary,
          content: newsContent,
          cover_image_url: newsCoverImage || undefined,
          broadcastNotification: broadcastNotif,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish news bulletin");

      setFeedback({
        type: "success",
        message: "Bulletin published successfully and alerts broadcasted!",
      });

      // Reset form
      setNewsTitle("");
      setNewsSummary("");
      setNewsContent("");
      setNewsCoverImage("");
      loadAdminData();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete News
  const handleDeleteNews = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bulletin?")) return;
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFeedback({ type: "success", message: "Article removed." });
        loadAdminData();
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  // Handle Withdrawal Approval / Rejection
  const handleWithdrawalAction = async (
    withdrawalId: string,
    status: "completed" | "rejected",
    failureReason?: string
  ) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, status, failureReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update withdrawal status");

      setFeedback({
        type: "success",
        message: data.message || `Withdrawal marked as ${status}.`,
      });
      setRejectModalTarget(null);
      setRejectModalReason("");
      loadAdminData();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  if (authLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-pitch-surface border border-rose-500/30 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Administrative Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          This portal is reserved strictly for Super Administrator <strong className="text-slate-200">{PRIMARY_SUPER_ADMIN_EMAIL}</strong> and authorized platform moderators.
        </p>
        <Link href="/">
          <Button variant="secondary" size="sm" className="w-full mt-2">
            Return to Marketplace Home
          </Button>
        </Link>
      </div>
    );
  }

  const filteredListings = listings.filter((l) => {
    if (!listingSearch.trim()) return true;
    const q = listingSearch.toLowerCase();
    return (
      l.title?.toLowerCase().includes(q) ||
      l.seller?.username?.toLowerCase().includes(q) ||
      l.platform?.toLowerCase().includes(q)
    );
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone_number?.toLowerCase().includes(q)
    );
  });

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const pendingWithdrawalsCount = pendingWithdrawals.length;
  const pendingWithdrawalsSum = pendingWithdrawals.reduce(
    (sum, w) => sum + Number(w.amount || 0),
    0
  );

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (withdrawalFilter !== "all" && w.status !== withdrawalFilter) {
      return false;
    }
    if (!withdrawalSearch.trim()) return true;
    const q = withdrawalSearch.toLowerCase();
    return (
      w.phone_number?.toLowerCase().includes(q) ||
      w.seller?.username?.toLowerCase().includes(q) ||
      w.seller?.email?.toLowerCase().includes(q) ||
      String(w.amount).includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Super Admin Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pitch-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isSuperAdmin
                ? "Primary Super Administrator Active"
                : "Platform Administrator Active"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            Executive Admin Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Super Administrator: <strong className="text-slate-200">{PRIMARY_SUPER_ADMIN_EMAIL}</strong> (Brian Okibo, Chief Executive Officer)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadAdminData}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
          <Link href="/seller/create-listing">
            <Button variant="gold" size="sm" className="text-xs font-bold shadow-md">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Direct Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/60 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Key Metric Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-pitch-surface border border-pitch-border space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Accounts
          </span>
          <p className="text-2xl font-black text-white font-display">{users.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-pitch-surface border border-pitch-border space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Listings
          </span>
          <p className="text-2xl font-black text-brand-400 font-display">{listings.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-pitch-surface border border-pitch-border space-y-1">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Payouts</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </span>
          <p className="text-2xl font-black text-amber-400 font-display">
            {pendingWithdrawalsCount}
          </p>
          <span className="text-[10px] text-slate-400 block font-mono truncate">
            {formatCurrency(pendingWithdrawalsSum)} queued
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-pitch-surface border border-pitch-border space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Bans
          </span>
          <p className="text-2xl font-black text-rose-400 font-display">
            {users.filter((u) => u.is_suspended).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-pitch-surface border border-pitch-border space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            News & Alerts
          </span>
          <p className="text-2xl font-black text-indigo-400 font-display">{articles.length}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-pitch-border/80 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("listings")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === "listings"
              ? "border-amber-400 text-amber-400 bg-pitch-surface"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Listing Moderation (Ban Posts)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
            {listings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === "users"
              ? "border-amber-400 text-amber-400 bg-pitch-surface"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("withdrawals")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === "withdrawals"
              ? "border-amber-400 text-amber-400 bg-pitch-surface"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>Seller Withdrawals (M-Pesa)</span>
          {pendingWithdrawalsCount > 0 ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 animate-pulse">
              {pendingWithdrawalsCount} pending
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {withdrawals.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("news")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === "news"
              ? "border-amber-400 text-amber-400 bg-pitch-surface"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Post News & Alerts</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
            {articles.length}
          </span>
        </button>
      </div>

      {/* TAB 1: LISTING MODERATION (BRING DOWN / BAN POSTS) */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Bring down any squad listing that violates rules (e.g. fake stats, off-platform solicitations).
            </p>
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                placeholder="Search listing or seller..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-pitch-surface border border-pitch-border text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-pitch-surface border border-pitch-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pitch-card border-b border-pitch-border text-slate-400 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Listing Title</th>
                    <th className="p-3.5">Seller</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Platform & OVR</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-border/60">
                  {filteredListings.length > 0 ? (
                    filteredListings.map((l) => (
                      <tr key={l.id} className="hover:bg-pitch-card/40 transition-colors">
                        <td className="p-3.5">
                          <Link
                            href={`/listings/${l.id}`}
                            className="font-bold text-white hover:text-amber-400 transition-colors block max-w-xs truncate"
                          >
                            {l.title}
                          </Link>
                          <span className="text-[10px] text-slate-500">ID: {l.id.slice(0, 8)}...</span>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <span className="font-semibold">{l.seller?.username || "Unknown"}</span>
                          {l.seller?.is_suspended && (
                            <span className="block text-[10px] text-rose-400 font-bold">Banned Seller</span>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-emerald-400">
                          {formatCurrency(l.price, l.currency || "KES")}
                        </td>
                        <td className="p-3.5 text-slate-400">
                          <span>{l.platform}</span> • <span>OVR {l.overall_team_strength}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              l.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : l.status === "suspended"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {l.status === "active" ? (
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => setTakedownTarget(l)}
                                className="text-xs font-semibold py-1 px-2.5"
                              >
                                <Ban className="w-3.5 h-3.5 mr-1" />
                                Bring Down
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => handleModerateListing(l.id, "reinstate")}
                                disabled={actionLoading}
                                className="text-xs py-1 px-2.5 text-emerald-400"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Reinstate
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No listings match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT & ADMIN PRIVILEGES */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Grant or dismiss administrator privileges, ban scam accounts, and manage trader access.
            </p>
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user or email..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-pitch-surface border border-pitch-border text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-pitch-surface border border-pitch-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pitch-card border-b border-pitch-border text-slate-400 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">User Profile</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Platform Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Sales / Rating</th>
                    <th className="p-3.5 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-border/60">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => {
                      const isTargetSuperAdmin = isSuperAdminEmail(u.email);
                      const isTargetAdmin = u.role === "admin" || isTargetSuperAdmin;

                      return (
                        <tr key={u.id} className="hover:bg-pitch-card/40 transition-colors">
                          <td className="p-3.5">
                            <span className="font-bold text-white block">{u.username}</span>
                            <span className="text-[10px] text-slate-500">ID: {u.id.slice(0, 8)}...</span>
                          </td>
                          <td className="p-3.5 text-slate-300 font-mono text-[11px]">
                            {u.email || "No email on record"}
                          </td>
                          <td className="p-3.5">
                            {isTargetSuperAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-[10px] uppercase">
                                <Crown className="w-3 h-3 text-amber-400" />
                                Super Admin
                              </span>
                            ) : isTargetAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 font-bold text-[10px] uppercase">
                                <Shield className="w-3 h-3 text-brand-400" />
                                Administrator
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                                Trader
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {u.is_suspended ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold">
                                Banned / Suspended
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                                Active & Good Standing
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-400">
                            <span>{u.completed_sales_count || 0} sales</span> • <span>⭐ {u.seller_rating || "5.0"}</span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Cannot alter Super Admin */}
                              {isTargetSuperAdmin ? (
                                <span className="text-[10px] font-bold text-slate-500 italic">
                                  Immutable Super Admin
                                </span>
                              ) : (
                                <>
                                  {/* Role Promotion / Dismissal (Only Super Admin can execute) */}
                                  {isSuperAdmin && (
                                    <>
                                      {isTargetAdmin ? (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleUserAction(u.id, "dismiss_admin")}
                                          disabled={actionLoading}
                                          className="text-[11px] py-1 px-2 text-amber-400 hover:text-rose-400"
                                          title="Dismiss Administrator privileges"
                                        >
                                          <UserMinus className="w-3.5 h-3.5 mr-1" />
                                          Dismiss Admin
                                        </Button>
                                      ) : (
                                        <Button
                                          type="button"
                                          variant="secondary"
                                          size="sm"
                                          onClick={() => handleUserAction(u.id, "grant_admin")}
                                          disabled={actionLoading}
                                          className="text-[11px] py-1 px-2 text-brand-400"
                                          title="Grant Administrator privileges"
                                        >
                                          <UserPlus className="w-3.5 h-3.5 mr-1" />
                                          Make Admin
                                        </Button>
                                      )}
                                    </>
                                  )}

                                  {/* Ban / Unban User */}
                                  {u.is_suspended ? (
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleUserAction(u.id, "unban_user")}
                                      disabled={actionLoading}
                                      className="text-[11px] py-1 px-2 text-emerald-400"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                      Lift Ban
                                    </Button>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleUserAction(u.id, "ban_user")}
                                      disabled={actionLoading}
                                      className="text-[11px] py-1 px-2 font-semibold"
                                    >
                                      <Ban className="w-3.5 h-3.5 mr-1" />
                                      Ban User
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No users match your search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: POST NEWS & SCAMMER ALERTS */}
      {activeTab === "news" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Post Form */}
          <div className="lg:col-span-2 bg-pitch-surface border border-pitch-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Publish Official Community Bulletin
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Post scammer alerts, eFootball game updates, and escrow guides. Sends broadcast notifications to all traders.
              </p>
            </div>

            <form onSubmit={handleCreateNews} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Article Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="e.g. 🚨 SCAMMER ALERT: Blacklist of Impersonator Phone Numbers"
                  className="w-full rounded-xl bg-pitch-card border border-pitch-border px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-200">Category</label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value as NewsCategory)}
                    className="w-full rounded-xl bg-pitch-card border border-pitch-border px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="scammer_alert">🚨 Scammer Alert (High Priority)</option>
                    <option value="efootball_news">⚽ eFootball News & Updates</option>
                    <option value="escrow_guide">🛡️ Escrow Guide & Tips</option>
                    <option value="announcement">📢 Official Marketplace Notice</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-200">
                    Cover Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newsCoverImage}
                    onChange={(e) => setNewsCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl bg-pitch-card border border-pitch-border px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Short Summary <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  placeholder="Brief 1-2 sentence overview shown in notifications and cards..."
                  rows={2}
                  className="w-full rounded-xl bg-pitch-card border border-pitch-border px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Full Bulletin Content (Markdown supported) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  placeholder="Write the complete bulletin details, scammer evidence, or eFootball patch analysis..."
                  rows={8}
                  className="w-full rounded-xl bg-pitch-card border border-pitch-border px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-brand-500 leading-relaxed"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Broadcast Push Notification Alert</p>
                  <p className="text-[11px] text-slate-400">
                    Immediately send an in-app notification to all registered buyers & sellers.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={broadcastNotif}
                  onChange={(e) => setBroadcastNotif(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-pitch-surface border-pitch-border cursor-pointer"
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full font-bold shadow-xl"
                isLoading={actionLoading}
              >
                Publish & Alert Community
              </Button>
            </form>
          </div>

          {/* Right Column: Published Articles Manager */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Published Bulletins ({articles.length})
            </h3>

            <div className="space-y-3 max-h-[640px] overflow-y-auto">
              {articles.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-pitch-surface border border-pitch-border space-y-2 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        item.category === "scammer_alert"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                      }`}
                    >
                      {item.category.replace("_", " ")}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteNews(item.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-2">
                    <Link href={`/news/${item.slug}`} className="hover:text-amber-400">
                      {item.title}
                    </Link>
                  </h4>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <span>{item.views_count} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SELLER WITHDRAWALS (M-PESA PAYOUTS) */}
      {activeTab === "withdrawals" && (
        <div className="space-y-6">
          {/* Executive Instructions / Operations Manual */}
          <div className="p-5 rounded-2xl bg-pitch-surface border border-pitch-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pitch-border/60 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Banknote className="w-4 h-4" />
                <span>Executive Till Operations &amp; Seller Payouts</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                UnifiedPay Till: <strong className="text-white">1572931</strong>
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When a seller requests a withdrawal, their available balance is reserved immediately. Follow this standard operating procedure:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1">
                <span className="font-bold text-amber-400 block text-[11px]">Step 1: Check Seller &amp; Phone</span>
                <p className="text-[11px] text-slate-400">Click &quot;Copy&quot; next to the seller&apos;s phone number to paste it into M-Pesa.</p>
              </div>
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1">
                <span className="font-bold text-amber-400 block text-[11px]">Step 2: Disburse Funds</span>
                <p className="text-[11px] text-slate-400">Send the requested KES amount from your Till (1572931) to their M-Pesa line.</p>
              </div>
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1">
                <span className="font-bold text-emerald-400 block text-[11px]">Step 3: Mark Paid</span>
                <p className="text-[11px] text-slate-400">Click &quot;Mark Paid / Completed&quot;. The seller receives an instant success alert.</p>
              </div>
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1">
                <span className="font-bold text-rose-400 block text-[11px]">Alternative: Reject &amp; Refund</span>
                <p className="text-[11px] text-slate-400">If the phone is invalid, reject with a reason to automatically restore their balance.</p>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-pitch-surface border border-pitch-border text-xs overflow-x-auto">
              {(["all", "pending", "completed", "rejected"] as const).map((filter) => {
                const count =
                  filter === "all"
                    ? withdrawals.length
                    : withdrawals.filter((w) => w.status === filter).length;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setWithdrawalFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all capitalize flex items-center gap-1.5 shrink-0 ${
                      withdrawalFilter === filter
                        ? "bg-amber-500 text-pitch-dark font-bold shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{filter}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        withdrawalFilter === filter
                          ? "bg-black/20 text-pitch-dark font-bold"
                          : "bg-pitch-card text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search phone, seller, amount..."
                value={withdrawalSearch}
                onChange={(e) => setWithdrawalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-pitch-surface border border-pitch-border text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Table / List */}
          {filteredWithdrawals.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-pitch-surface border border-pitch-border text-slate-400 space-y-2">
              <Banknote className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-semibold text-slate-300">No withdrawal requests found</p>
              <p className="text-[11px] text-slate-500">
                {withdrawalFilter !== "all"
                  ? `There are no withdrawals with status "${withdrawalFilter}".`
                  : "No sellers have requested withdrawals yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-pitch-card/60 border-b border-pitch-border text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Seller</th>
                      <th className="px-4 py-3">M-Pesa Phone</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Requested Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pitch-border/50">
                    {filteredWithdrawals.map((w) => {
                      const isPending = w.status === "pending";
                      const isCompleted = w.status === "completed";
                      const isRejected = w.status === "rejected";

                      return (
                        <tr key={w.id} className="hover:bg-pitch-card/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-white">
                              {w.seller?.username || "Unknown Seller"}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {w.seller?.email || w.seller_id}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 font-mono text-slate-200">
                              <span>{w.phone_number}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyPhone(w.phone_number)}
                                className="p-1 rounded hover:bg-pitch-card text-slate-400 hover:text-white transition-colors"
                                title="Copy phone number"
                              >
                                {copiedPhone === w.phone_number ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 font-mono font-bold text-emerald-400 text-sm">
                            {formatCurrency(w.amount)}
                          </td>

                          <td className="px-4 py-3.5">
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                                <Clock className="w-3 h-3 animate-spin text-amber-400" />
                                Pending Payout
                              </span>
                            )}
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Completed / Paid
                              </span>
                            )}
                            {isRejected && (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                Rejected &amp; Refunded
                              </span>
                                {w.failure_reason && (
                                  <p className="text-[10px] text-slate-500 italic max-w-xs truncate">
                                    Reason: {w.failure_reason}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-[11px] text-slate-400">
                            {new Date(w.created_at).toLocaleString()}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    setRejectModalTarget(w);
                                    setRejectModalReason("");
                                  }}
                                  disabled={actionLoading}
                                  className="text-xs"
                                >
                                  Reject &amp; Refund
                                </Button>
                                <Button
                                  variant="gold"
                                  size="sm"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Confirm that you have sent ${formatCurrency(w.amount)} to M-Pesa line ${w.phone_number}?`
                                      )
                                    ) {
                                      handleWithdrawalAction(w.id, "completed");
                                    }
                                  }}
                                  disabled={actionLoading}
                                  className="text-xs font-bold"
                                >
                                  <Check className="w-3.5 h-3.5 mr-1" />
                                  Mark Paid
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">No action needed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Takedown Listing with Reason */}
      {takedownTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-pitch-surface border border-pitch-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <Ban className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Bring Down Listing</h3>
              </div>
              <button
                type="button"
                onClick={() => setTakedownTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              You are taking down <strong className="text-white">&quot;{takedownTarget.title}&quot;</strong>.
              The seller will be notified with your explanation.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-200">
                Violation Explanation (Sent to Seller)
              </label>
              <textarea
                value={takedownReason}
                onChange={(e) => setTakedownReason(e.target.value)}
                placeholder="e.g. Listing removed: Inaccurate player card proof or suspected circumvention attempt."
                rows={3}
                className="w-full rounded-xl bg-pitch-card border border-pitch-border p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTakedownTarget(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleModerateListing(takedownTarget.id, "take_down", takedownReason)}
                isLoading={actionLoading}
                className="text-xs font-bold"
              >
                Confirm Takedown
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Withdrawal with Reason */}
      {rejectModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-pitch-surface border border-pitch-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Reject Withdrawal &amp; Refund</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              You are rejecting the withdrawal of{" "}
              <strong className="text-emerald-400 font-mono">
                {formatCurrency(rejectModalTarget.amount)}
              </strong>{" "}
              for{" "}
              <strong className="text-white">
                {rejectModalTarget.seller?.username || rejectModalTarget.phone_number}
              </strong>
              . The funds will be automatically credited back to their Available Balance.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-200">
                Rejection Reason (Sent to Seller)
              </label>
              <textarea
                value={rejectModalReason}
                onChange={(e) => setRejectModalReason(e.target.value)}
                placeholder="e.g. Invalid phone number format, M-Pesa name mismatch, or network bounce."
                rows={3}
                className="w-full rounded-xl bg-pitch-card border border-pitch-border p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalTarget(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() =>
                  handleWithdrawalAction(
                    rejectModalTarget.id,
                    "rejected",
                    rejectModalReason || "Declined by platform administrator. Funds refunded."
                  )
                }
                isLoading={actionLoading}
                className="text-xs font-bold"
              >
                Confirm Rejection &amp; Refund
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminControlCenterPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-slate-400">
          Loading Executive Admin Control Center...
        </div>
      }
    >
      <AdminControlCenterContent />
    </Suspense>
  );
}
