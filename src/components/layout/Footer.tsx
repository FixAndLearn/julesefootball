"use client";

import { Shield, Lock, CreditCard, Building2, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Compact footer for non-home pages (orders, dashboards, chat, browse, etc.)
  // Compact footer for non-home pages
  if (!isHomePage) {
    return (
      <footer className="w-full border-t border-[#1F2937] bg-[#0B1220] text-[#94A3B8] text-xs mt-auto py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-x-6 gap-y-2 flex-wrap text-[#94A3B8] justify-center md:justify-start">
            <Link href="/" className="font-bold text-[#F8FAFC] hover:text-white transition-colors">
              eFootball Kenya
            </Link>
            <Link href="/tournaments" className="hover:text-[#F8FAFC] transition-colors">
              Tournaments
            </Link>
            <Link href="/news" className="hover:text-[#F8FAFC] transition-colors">
              News & Alerts
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
            <span>© {new Date().getFullYear()} eFootball Community Kenya</span>
          </div>
        </div>
      </footer>
    );
  }

  // Full detailed footer for the homepage
  return (
    <footer className="w-full border-t border-[#1F2937] bg-[#0B1220] text-[#94A3B8] text-sm mt-auto">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Category 1: Community */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#F8FAFC] mb-4">
              Community & Competition
            </h4>
            <ul className="space-y-2.5 text-xs text-[#94A3B8]">
              <li>
                <Link href="/tournaments" className="hover:text-[#F8FAFC] transition-colors">
                  Tournaments & Brackets
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-[#F8FAFC] transition-colors">
                  News & Game Updates
                </Link>
              </li>
              <li>
                <Link href="/news?category=scammer_alert" className="hover:text-[#F8FAFC] transition-colors">
                  Scammer Alerts & Warnings
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/254794400365"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#22C55E] transition-colors"
                >
                  Join WhatsApp Player Group
                </a>
              </li>
            </ul>
          </div>

          {/* Category 2: Policies & Safety */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#F8FAFC] mb-4">
              Policies & Safety
            </h4>
            <ul className="space-y-2.5 text-xs text-[#94A3B8]">
              <li>
                <Link href="/terms" className="hover:text-[#F8FAFC] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#F8FAFC] transition-colors">
                  Privacy & Data Policy
                </Link>
              </li>
              <li>
                <Link href="/dispute-policy" className="hover:text-[#F8FAFC] transition-colors">
                  Dispute Resolution Policy
                </Link>
              </li>
              <li>
                <Link href="/fraud-prevention" className="hover:text-[#F8FAFC] transition-colors">
                  Anti-Fraud Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Category 3: Contact & Administration */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#F8FAFC] mb-4">
              Contact & Administration
            </h4>
            <p className="text-xs text-[#94A3B8] mb-3">
              Direct community assistance, tournament inquiries, and incident reporting.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="tel:0794400365"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#F8FAFC] hover:bg-[#1F2937] transition-colors w-fit"
              >
                <Phone className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Call: 0794400365</span>
              </a>
              <a
                href="https://wa.me/254794400365"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#22C55E] hover:bg-[#1F2937] transition-colors w-fit"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>WhatsApp: +254 794 400 365</span>
              </a>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-xs text-[#94A3B8] w-fit mt-1">
                <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>Administration: Brian Okibo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Attribution & Konami Notice */}
        <div className="border-t border-[#1F2937] mt-10 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-[#94A3B8] gap-4">
          <p className="shrink-0">© {new Date().getFullYear()} eFootball Community Kenya. All rights reserved.</p>
          <div className="text-[11px] text-[#94A3B8] leading-relaxed md:text-right max-w-2xl space-y-1">
            <p>
              <strong>Notice:</strong> eFootball Community Kenya is an independent community website and is not affiliated with, endorsed by, or sponsored by Konami Digital Entertainment Inc. eFootball™ is a registered trademark of Konami Digital Entertainment Inc.
            </p>
            <p className="text-slate-500">
              According to <a href="https://www.konami.com/efootball/en-us/topic/news/5174" target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#F8FAFC] underline">Konami&apos;s official notice</a>, loaning, selling, or transferring game accounts to a third party and allowing a third party to use your user ID or password are prohibited under its Terms of Use.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
