import React from "react";

export function JsonLd({ siteUrl = "https://www.efootballmarket.co.ke" }: { siteUrl?: string }) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "eFootballMarket Kenya",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://efootballmarket.co.ke/browse?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "eFootballMarket Kenya",
    url: "https://efootballmarket.co.ke",
    logo: "https://efootballmarket.co.ke/icon.svg",
    founder: {
      "@type": "Person",
      name: "Brian Okibo",
      jobTitle: "Founder & Lead Escrow Officer",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+254-794-400-365",
      contactType: "customer service",
      areaServed: "KE",
      availableLanguage: ["English", "Swahili"],
    },
    sameAs: [
      "https://wa.me/254794400365",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does Safaricom M-Pesa Escrow protect eFootball buyers in Kenya?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "When a buyer orders a squad, payment is locked securely in Safaricom Till 1572931. The seller submits login credentials through encrypted transfer. The buyer receives a mandatory 24-hour inspection window to verify player ratings, GP, and Konami ID before any payout is disbursed to the seller.",
        },
      },
      {
        "@type": "Question",
        name: "What is Bring-Your-Own-Deal Middleman Escrow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "If you find a buyer or seller on WhatsApp, TikTok, or Facebook, you can bring the transaction to eFootballMarket Middleman. Both parties submit details, the buyer pays through M-Pesa STK push, and we hold funds until the transfer is 100% verified.",
        },
      },
      {
        "@type": "Question",
        name: "How do tournament prize payouts work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All eFootball Kenya tournament prize pools are disbursed directly to the winning player's Safaricom M-Pesa mobile number within 15 minutes of match score verification by administrator Brian Okibo.",
        },
      },
      {
        "@type": "Question",
        name: "Is eFootballMarket affiliated with Konami Digital Entertainment?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. eFootballMarket is an independent Kenyan peer-to-peer escrow intermediary and community organizer. It is not affiliated with, endorsed by, or sponsored by Konami Digital Entertainment.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
