"use client";

import { Shield, Lock, CreditCard, Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Compact footer for non-home pages (orders, dashboards, chat, browse, etc.)
  if (!isHomePage) {
    return (
      <footer className="w-full border-t border-pitch-border/60 bg-pitch-surface/60 backdrop-blur-sm text-slate-400 text-xs mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap text-slate-400">
            <Link href="/" className="font-semibold text-slate-200 hover:text-white transition-colors">
              eFootballMarket
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/browse" className="hover:text-slate-200 transition-colors">
              Browse Accounts
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/news" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              🚨 Alerts & News
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/escrow-guarantee" className="hover:text-slate-200 transition-colors">
              Escrow Protection
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/terms" className="hover:text-slate-200 transition-colors">
              Terms
            </Link>
          </div>

          <div className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} eFootballMarket Inc. Under Executive Leadership of Brian Okibo, CEO.
          </div>
        </div>
      </footer>
    );
  }

  // Full detailed footer for the homepage
  return (
    <footer className="w-full border-t border-pitch-border/80 bg-pitch-card/90 text-slate-400 text-sm mt-auto">
      {/* Trust & Escrow Guarantee Ribbon */}
      <div className="border-b border-pitch-border/60 bg-pitch-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">100% Escrow Protected</p>
                <p className="text-xs text-slate-400">Funds released only after buyer confirms account access.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-950/60 border border-brand-800/40 flex items-center justify-center text-brand-400 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Instant M-Pesa STK Push</p>
                <p className="text-xs text-slate-400">Direct mobile checkout via Safaricom Daraja API v2.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">AES-256 Encrypted Transfer</p>
                <p className="text-xs text-slate-400">Konami ID credentials stored with authenticated encryption.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-200 mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/browse" className="hover:text-white transition-colors">All Accounts</Link></li>
              <li><Link href="/browse?platform=android" className="hover:text-white transition-colors">Android Accounts</Link></li>
              <li><Link href="/browse?platform=ios" className="hover:text-white transition-colors">iOS Accounts</Link></li>
              <li><Link href="/browse?platform=pc_steam" className="hover:text-white transition-colors">PC / Steam</Link></li>
              <li><Link href="/browse?platform=playstation_5" className="hover:text-white transition-colors">PlayStation 5</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-200 mb-4">Sellers</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/seller/create-listing" className="hover:text-white transition-colors">Create Listing</Link></li>
              <li><Link href="/seller/verification" className="hover:text-white transition-colors">Seller Verification (Coming Soon)</Link></li>
              <li><Link href="/seller/earnings" className="hover:text-white transition-colors">Earnings & Withdrawals</Link></li>
              <li><Link href="/seller/guidelines" className="hover:text-white transition-colors">Seller Policy & Standards</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-200 mb-4">Trust & Security</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/news" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">🚨 News & Scammer Alerts</Link></li>
              <li><Link href="/escrow-guarantee" className="hover:text-white transition-colors">Escrow Protection Rules</Link></li>
              <li><Link href="/dispute-policy" className="hover:text-white transition-colors">Dispute Resolution Policy</Link></li>
              <li><Link href="/fraud-prevention" className="hover:text-white transition-colors">Anti-Fraud Systems</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy & Data Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-200 mb-4">Payment Methods & Governance</h4>
            <p className="text-xs text-slate-400 mb-3">
              Automated Safaricom Lipa Na M-Pesa STK Push settlement.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              M-PESA STK Verified
            </div>

            {/* Corporate Governance Badge */}
            <div className="pt-2 border-t border-pitch-border/60">
              <span className="text-[11px] text-slate-400 block mb-1">Executive Leadership:</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pitch-card border border-pitch-border text-xs font-medium text-slate-200">
                <Building2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Brian Okibo, Chief Executive Officer (CEO)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="border-t border-pitch-border/60 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} eFootballMarket Inc. Under Executive Leadership of Brian Okibo, CEO. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 text-[11px] text-slate-400">
            eFootball™ is a trademark of Konami Digital Entertainment. eFootballMarket is an independent escrow intermediary.
          </p>
        </div>
      </div>
    </footer>
  );
}
