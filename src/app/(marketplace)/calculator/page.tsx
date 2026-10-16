import { Metadata } from "next";
import Link from "next/link";
import { SquadValuationCalculator } from "@/components/calculator/SquadValuationCalculator";
import { AdBanner } from "@/components/common/AdBanner";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  Calculator,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Coins,
  Trophy,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  FileQuestion,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "eFootball Account Valuation Calculator Kenya | Instant KES Price Estimator",
  description:
    "Free eFootball (PES Mobile) account price calculator in Kenya Shillings (KES). Determine the true market value of your squad based on OVR strength, Epics, Big Time cards, and Division standing.",
  keywords: [
    "eFootball account price calculator",
    "eFootball squad valuation Kenya",
    "how much is my eFootball account worth",
    "PES mobile account worth KES",
    "sell eFootball account Kenya M-Pesa",
    "eFootball coin value Kenya",
  ],
  openGraph: {
    title: "eFootball Account Valuation Calculator Kenya | eFootballMarket",
    description:
      "Instant market valuation for eFootball mobile accounts in Kenya. Estimate fair KES value with live M-Pesa escrow pricing benchmarks.",
    type: "website",
  },
};

export default function CalculatorPage() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Squad Valuation Calculator", url: "/calculator" },
  ];

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "eFootball Squad Valuation Calculator Kenya",
    operatingSystem: "All",
    applicationCategory: "FinanceApplication",
    description:
      "Algorithmic valuation model for estimating eFootball (PES) mobile gaming accounts in Kenyan Shillings (KES).",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KES",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How is eFootball account value calculated in Kenya?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our algorithm evaluates five key parameters: Team Collective Strength (OVR), count of Epic and Big Time booster players, in-game Coin and GP reserves, Division 1 standing, and mobile platform (Android vs iOS). Values are calibrated against verified Safaricom M-Pesa escrow settlement prices.",
        },
      },
      {
        "@type": "Question",
        name: "Do eFootball coins have real monetary value?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. In Kenyan peer-to-peer trading, unspent eFootball coins are valued at approximately KES 110 per 100 coins, reflecting the direct in-game purchase cost minus account depreciation.",
        },
      },
      {
        "@type": "Question",
        name: "How do I safely sell my account once I know its value?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can create a verified listing on eFootballMarket with zero upfront fees. The buyer locks payment into Safaricom Lipa Na M-Pesa Till 1572931. After the buyer inspects the account within the 24-hour escrow window, the payment is disbursed directly to your M-Pesa phone number.",
        },
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-200 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Squad Valuation Calculator</span>
      </nav>

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-inner">
          <Calculator className="w-4 h-4 text-amber-400" />
          <span>Algorithmic Valuation Engine v2.4</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight">
          How Much is Your <span className="text-amber-400">eFootball Account</span> Worth?
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Accurately calculate your squad’s true fair market price in Kenya Shillings (KES). Calibrated against hundreds of verified Safaricom M-Pesa escrow settlements on Till 1572931.
        </p>
      </div>

      {/* The Interactive Calculator Component */}
      <div className="w-full">
        <SquadValuationCalculator />
      </div>

      {/* AdSense Slot */}
      <div className="py-2">
        <AdBanner slot="calculator_mid_page" format="horizontal" />
      </div>

      {/* Institutional Explanatory Authority Guide */}
      <div className="rounded-3xl bg-[#111827] border border-[#1F2937] p-6 sm:p-10 shadow-2xl space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Valuation Methodology Standard</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            How eFootball Account Pricing is Determined in Kenya
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Editorial guidelines supervised by Lead Escrow Officer Brian Okibo to eliminate arbitrary pricing and predatory lowballing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#0B1220] border border-[#1F2937] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">1. Team OVR Strength Curve</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Squad value scales exponentially once collective strength crosses 3100+ OVR. Accounts with 3150+ OVR command premium liquidity because they represent top 1% competitive division rosters.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1220] border border-[#1F2937] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">2. Epics & Booster Weighting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Permanent Epic booster cards (such as 2015 Messi, Rummenigge, Vieira, Cruyff) retain long-term market value because they are unpurchasable once box draws expire.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1220] border border-[#1F2937] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">3. Coin & Liquid Reserves</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unspent coins provide immediate flexibility for the buyer to open upcoming weekly packs. We benchmark 100 coins at approximately KES 110 of net added account worth.
            </p>
          </div>
        </div>

        {/* Protection Notice */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Fee Seller Listing with Safaricom Till 1572931</span>
            </div>
            <p className="text-xs text-slate-300">
              Ready to cash out? List your account at the recommended price and get paid via M-Pesa immediately after buyer inspection.
            </p>
          </div>
          <Link href="/seller/create-listing" className="shrink-0">
            <button className="px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-black text-xs transition-all shadow-lg shadow-emerald-950/40">
              Create Listing Now &rarr;
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
