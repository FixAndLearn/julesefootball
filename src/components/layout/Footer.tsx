"use client";

import { Shield, Lock, CreditCard, Building2, Phone, MessageCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isMinimalFlow = pathname.startsWith("/pay/");

  // Minimal footer only for focused checkout flow
  if (isMinimalFlow) {
    return (
      <footer className="w-full border-t border-[#1F2937] bg-[#0B1220] text-[#94A3B8] text-xs mt-auto py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-x-6 gap-y-2 flex-wrap text-[#94A3B8] justify-center md:justify-start">
            <Link href="/" className="font-bold text-[#F8FAFC] hover:text-white transition-colors">
              eFootballMarket
            </Link>
            <Link href="/browse" className="hover:text-[#F8FAFC] transition-colors">
              Browse Accounts
            </Link>
            <Link href="/middleman" className="hover:text-[#F8FAFC] transition-colors">
              Middleman
            </Link>
            <Link href="/tournaments" className="hover:text-[#F8FAFC] transition-colors">
              Tournaments
            </Link>
            <Link href="/news" className="hover:text-[#F8FAFC] transition-colors">
              News & Alerts
            </Link>
            <Link href="/escrow-guarantee" className="hover:text-[#F8FAFC] transition-colors">
              Escrow Rules
            </Link>
            <Link href="/terms" className="hover:text-[#F8FAFC] transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#F8FAFC] transition-colors">
              Privacy
            </Link>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-[11px] text-[#94A3B8]">
            <a
              href="https://wa.me/254794400365"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#22C55E] hover:underline transition-colors"
            >
              <MessageCircle className="w-3 h-3 text-[#22C55E]" />
              <span>WhatsApp: 0794400365</span>
            </a>
            <span>© {new Date().getFullYear()} eFootballMarket</span>
          </div>
        </div>
      </footer>
    );
  }

  // Full detailed footer for the homepage
  return (
    <footer className="w-full border-t border-[#1F2937] bg-[#0B1220] text-[#94A3B8] text-sm mt-auto">
      {/* Trust & Escrow Guarantee Ribbon */}
      <div className="border-b border-[#1F2937] bg-[#111827]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-[#22C55E] shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">100% Escrow Protected</p>
                <p className="text-xs text-[#94A3B8]">Funds held safely until the buyer verifies squad credentials.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#111827] border border-[#1F2937] flex items-center justify-center text-[#22C55E] shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">Instant M-Pesa STK Push</p>
                <p className="text-xs text-[#94A3B8]">Direct payment via Safaricom Daraja API v2 (Till 1572931).</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-[#FBBF24] shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">AES-256 Encrypted Transfer</p>
                <p className="text-xs text-[#94A3B8]">Konami ID credentials stored with authenticated encryption.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1: Marketplace */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#F8FAFC] mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-xs text-[#94A3B8]">
              <li><Link href="/browse" className="hover:text-white transition-colors">All Accounts</Link></li>
              <li><Link href="/browse?platform=android" className="hover:text-white transition-colors">Android Accounts</Link></li>
              <li><Link href="/browse?platform=ios" className="hover:text-white transition-colors">iOS Accounts</Link></li>
              <li><Link href="/browse?platform=pc_steam" className="hover:text-white transition-colors">PC / Steam</Link></li>
              <li><Link href="/browse?platform=playstation_5" className="hover:text-white transition-colors">PlayStation 5</Link></li>
              <li><Link href="/middleman" className="text-[#22C55E] hover:underline font-semibold transition-colors">Middleman Escrow</Link></li>
              <li><Link href="/wanted" className="text-[#FBBF24] hover:underline font-semibold transition-colors">Wanted Squads</Link></li>
            </ul>
          </div>

          {/* Col 2: Sellers */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#F8FAFC] mb-4">Sellers</h4>
            <ul className="space-y-2.5 text-xs text-[#94A3B8]">
              <li><Link href="/seller/create-listing" className="hover:text-white transition-colors">Create Listing</Link></li>
              <li><Link href="/seller/verification" className="hover:text-white transition-colors">Seller Verification & Badges</Link></li>
              <li><Link href="/seller/earnings" className="hover:text-white transition-colors">Earnings & Withdrawals</Link></li>
              <li><Link href="/seller/guidelines" className="hover:text-white transition-colors">Seller Policy & Standards</Link></li>
            </ul>
          </div>

          {/* Col 3: Community & Competition */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#F8FAFC] mb-4">Community & Tournaments</h4>
            <ul className="space-y-2.5 text-xs text-[#94A3B8]">
              <li><Link href="/tournaments" className="hover:text-white transition-colors">Tournaments & Brackets</Link></li>
              <li><Link href="/news" className="hover:text-white transition-colors">News & Game Updates</Link></li>
              <li><Link href="/news?category=scammer_alert" className="text-rose-400 hover:text-rose-300 font-medium transition-colors">Scammer Alerts & Warnings</Link></li>
              <li><Link href="/escrow-guarantee" className="hover:text-white transition-colors">Escrow Protection Rules</Link></li>
              <li><Link href="/dispute-policy" className="hover:text-white transition-colors">Dispute Resolution Policy</Link></li>
              <li><Link href="/fraud-prevention" className="hover:text-white transition-colors">Anti-Fraud Systems</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy & Data Policy</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("open-cookie-settings"));
                    }
                  }}
                  className="hover:text-white transition-colors text-left text-slate-400 hover:underline"
                >
                  Cookie Preferences & Consent
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Payments & Administration */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#F8FAFC] mb-4">Payment & Governance</h4>
            <p className="text-xs text-[#94A3B8] mb-3">
              Automated Safaricom Lipa Na M-Pesa STK Push escrow settlement.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-[#22C55E] text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              M-PESA Till 1572931 Verified
            </div>

            <div className="pt-2 border-t border-[#1F2937]">
              <span className="text-[11px] text-[#94A3B8] block mb-1">Official Escrow & Support Hotline:</span>
              <div className="flex flex-col gap-1.5 mb-3">
                <a
                  href="tel:0794400365"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#22C55E] hover:underline transition-colors w-fit"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>0794400365</span>
                </a>
                <a
                  href="https://wa.me/254794400365"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#22C55E] hover:underline transition-colors w-fit"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp: +254 794 400 365</span>
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1F2937]">
              <span className="text-[11px] text-[#94A3B8] block mb-1">Executive Leadership:</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111827] border border-[#1F2937] text-xs text-[#F8FAFC]">
                <Building2 className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>Brian Okibo, Chief Executive Officer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Attribution & Konami Disclaimer */}
        <div className="border-t border-[#1F2937] mt-10 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-[#94A3B8] gap-4">
          <p className="shrink-0">© {new Date().getFullYear()} eFootballMarket. All rights reserved.</p>
          <div className="text-[11px] text-[#94A3B8] leading-relaxed md:text-right max-w-2xl space-y-1">
            <p>
              eFootball™ is a registered trademark of Konami Digital Entertainment. eFootballMarket is an independent escrow intermediary and is not affiliated with Konami.
            </p>
            <p className="text-slate-500">
              According to <a href="https://www.konami.com/efootball/en-us/topic/news/5174" target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#F8FAFC] underline inline-flex items-center gap-0.5">Konami&apos;s official notice <ExternalLink className="w-3 h-3 ml-0.5" /></a>, selling or transferring accounts and sharing passwords are prohibited under Konami terms.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
