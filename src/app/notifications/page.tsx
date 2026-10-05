"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { Notification } from "@/types/database";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Coins,
  ExternalLink,
  Filter,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
  Trophy,
  AlertCircle,
  Inbox,
  ArrowRight,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} days ago`;
    return date.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recently";
  }
}

function getNotificationBadge(type: string) {
  switch (type) {
    case "funds_released":
    case "escrow_welcome":
    case "escrow":
      return {
        icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
        color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
        label: "Escrow & Payout",
      };
    case "order":
    case "order_status":
      return {
        icon: <ShoppingCart className="w-5 h-5 text-indigo-400" />,
        color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
        label: "Order Status",
      };
    case "seller_verification":
      return {
        icon: <Trophy className="w-5 h-5 text-amber-400" />,
        color: "bg-amber-500/10 border-amber-500/30 text-amber-300",
        label: "Merchant Badge",
      };
    case "mpesa_payment":
      return {
        icon: <Coins className="w-5 h-5 text-emerald-400" />,
        color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
        label: "M-Pesa Deposit",
      };
    default:
      return {
        icon: <Sparkles className="w-5 h-5 text-brand-400" />,
        color: "bg-brand-500/10 border-brand-500/30 text-brand-300",
        label: "System Alert",
      };
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "escrow" | "orders">("all");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string, actionUrl?: string | null) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (actionUrl) {
        router.push(actionUrl);
      }
    } catch (err) {
      console.warn("Failed to mark as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearRead = async () => {
    setActionLoading(true);
    try {
      setNotifications((prev) => prev.filter((n) => !n.is_read));

      await fetch("/api/notifications?clearRead=true", {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Failed to clear read notifications:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Failed to delete notification:", err);
    }
  };

  // Filter list by selected tab
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.is_read;
    if (activeTab === "escrow")
      return item.type.includes("escrow") || item.type.includes("funds");
    if (activeTab === "orders")
      return item.type.includes("order") || item.type.includes("payment");
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pitch-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Activity & Escrow Alerts</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-display">Notifications Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time alerts for M-Pesa escrow transfers, order deliveries, and account security.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="gold"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={actionLoading}
              className="text-xs font-semibold shadow-md"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              Mark all read ({unreadCount})
            </Button>
          )}

          {notifications.some((n) => n.is_read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearRead}
              disabled={actionLoading}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear read
            </Button>
          )}
        </div>
      </div>

      {/* Guest Guidance Banner if unauthenticated */}
      {!isAuthenticated && !authLoading && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-200">
                Log in to View Your Personalized Account Notifications
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Sign in to track real-time M-Pesa escrow confirmations, buyer messages, and order deliveries.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login?redirect=/notifications">
              <Button variant="secondary" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/register?redirect=/notifications">
              <Button variant="gold" size="sm" className="font-semibold shadow-md">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Filter Tabs */}
      <div className="flex items-center justify-between border-b border-pitch-border/80 pb-3 gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-brand-600 text-white shadow-md shadow-brand-900/50"
                : "bg-pitch-surface text-slate-400 hover:text-slate-200 hover:bg-pitch-card"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "unread"
                ? "bg-brand-600 text-white shadow-md shadow-brand-900/50"
                : "bg-pitch-surface text-slate-400 hover:text-slate-200 hover:bg-pitch-card"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("escrow")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "escrow"
                ? "bg-brand-600 text-white shadow-md shadow-brand-900/50"
                : "bg-pitch-surface text-slate-400 hover:text-slate-200 hover:bg-pitch-card"
            }`}
          >
            Escrow & Payouts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-brand-600 text-white shadow-md shadow-brand-900/50"
                : "bg-pitch-surface text-slate-400 hover:text-slate-200 hover:bg-pitch-card"
            }`}
          >
            Orders & Purchases
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
          <Shield className="w-3.5 h-3.5" />
          <span>M-Pesa Escrow Ledger Synced</span>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading your notification activity...</p>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((item) => {
            const badge = getNotificationBadge(item.type);

            return (
              <div
                key={item.id}
                onClick={() => handleMarkAsRead(item.id, item.action_url)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  !item.is_read
                    ? "bg-pitch-surface border-amber-500/40 shadow-lg shadow-amber-950/20 hover:border-amber-400/80"
                    : "bg-pitch-surface/60 border-pitch-border/80 hover:bg-pitch-surface hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-pitch-card border border-pitch-border flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    {badge.icon}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>
                        {badge.label}
                      </span>

                      {!item.is_read && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          New
                        </span>
                      )}

                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {item.message}
                    </p>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  {item.action_url && (
                    <Button
                      type="button"
                      variant="gold"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(item.id, item.action_url);
                      }}
                      className="text-xs font-semibold shadow-sm"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleDeleteOne(item.id, e)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-pitch-card border border-pitch-border flex items-center justify-center text-slate-500 mx-auto">
            <Inbox className="w-7 h-7 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No notifications found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {activeTab === "unread"
                ? "You're all caught up! There are no unread notifications right now."
                : "You have no activity records under this filter yet. When an escrow trade executes or an order is created, updates will appear here."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/browse">
              <Button variant="primary" size="sm" className="font-semibold text-xs">
                Browse Accounts
              </Button>
            </Link>
            <Link href="/seller/create-listing">
              <Button variant="secondary" size="sm" className="text-xs">
                Sell an Account
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
