"use client";

import { Phone, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/auth");

  const isHighIntentRoute =
    pathname.startsWith("/orders/") ||
    pathname.startsWith("/pay/") ||
    pathname === "/seller/verification" ||
    pathname === "/seller/create-listing";

  if (isAuthRoute || isHighIntentRoute) {
    return (
      <footer className="w-full border-t border-slate-800/80 bg-[#070B14] text-slate-400 text-xs mt-auto py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} eFootballMarket. 100% Escrow Protected (Safaricom Till 1572931).
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span className="text-slate-700">|</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-slate-700">|</span>
            <Link href="/escrow-guarantee" className="hover:text-white transition-colors">Escrow Guarantee</Link>
          </div>
        </div>
      </footer>
    );
  }

  // Full clean decompressed footer
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#070B14] text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Top Trust & Contact Bar */}
        <div className="pb-8 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight font-display">eFootballMarket</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Till 1572931 Escrow</span>
            </div>
            <p className="text-xs text-slate-400">
              Governed by Brian Okibo, CEO. Automated Safaricom Lipa Na M-Pesa custody.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <a
              href="tel:0794400365"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>0794400365</span>
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://wa.me/254794400365"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>

        {/* Balanced 4-Column Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 py-10">
          {/* Col 1: Marketplace */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-200">Marketplace</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/browse" className="hover:text-white transition-colors">Browse Squads</Link></li>
              <li><Link href="/browse?platform=android" className="hover:text-white transition-colors">Android Mobile</Link></li>
              <li><Link href="/browse?platform=ios" className="hover:text-white transition-colors">iOS Mobile</Link></li>
              <li><Link href="/middleman" className="hover:text-white transition-colors">Middleman Escrow</Link></li>
              <li><Link href="/wanted" className="hover:text-white transition-colors">Wanted Board</Link></li>
            </ul>
          </div>

          {/* Col 2: Sellers */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-200">Sellers</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/seller/create-listing" className="hover:text-white transition-colors">Create Listing</Link></li>
              <li><Link href="/seller/verification" className="hover:text-white transition-colors">Seller Verification</Link></li>
              <li><Link href="/seller/earnings" className="hover:text-white transition-colors">Earnings & Withdrawals</Link></li>
              <li><Link href="/seller/guidelines" className="hover:text-white transition-colors">Seller Guidelines</Link></li>
            </ul>
          </div>

          {/* Col 3: Trust & Security */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-200">Trust & Security</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/escrow-guarantee" className="hover:text-white transition-colors">Escrow Guarantee</Link></li>
              <li><Link href="/scammer-check" className="hover:text-white transition-colors">Scammer Blacklist</Link></li>
              <li><Link href="/dispute-policy" className="hover:text-white transition-colors">Dispute Policy</Link></li>
              <li><Link href="/fraud-prevention" className="hover:text-white transition-colors">Anti-Fraud Advisory</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal & Policy */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-200">Legal & Company</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/news" className="hover:text-white transition-colors">Community News</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("open-cookie-settings"));
                    }
                  }}
                  className="hover:text-white transition-colors text-left text-slate-400"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Attribution & Disclaimer */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} eFootballMarket. All rights reserved.</p>
          <p className="text-[11px] text-slate-500 max-w-xl md:text-right leading-relaxed">
            eFootball™ is a registered trademark of Konami Digital Entertainment. eFootballMarket is an independent escrow intermediary.
          </p>
        </div>
      </div>
    </footer>
  );
}
