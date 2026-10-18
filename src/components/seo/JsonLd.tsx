import React from "react";

export function JsonLd({ siteUrl = "https://www.efootballmarket.co.ke" }: { siteUrl?: string }) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "eFootballMarket",
    alternateName: ["eFootballMarket Kenya", "eFootball Market"],
    url: siteUrl,
    description: "Kenya's #1 verified eFootball account trading platform with Safaricom M-Pesa Till 1572931 escrow protection.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.efootballmarket.co.ke/browse?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "eFootballMarket",
    alternateName: ["eFootballMarket Kenya", "eFootball Market"],
    url: "https://www.efootballmarket.co.ke",
    logo: "https://www.efootballmarket.co.ke/logo.png",
    image: "https://www.efootballmarket.co.ke/logo.png",
    description:
      "Kenya's verified peer-to-peer eFootball account marketplace with automated Safaricom M-Pesa escrow protection (Till 1572931), 24h inspection window, and tournament hosting.",
    founder: {
      "@type": "Person",
      name: "Brian Okibo",
      jobTitle: "Founder & Chief Executive Officer (CEO)",
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

export function ProductJsonLd({
  listing,
  siteUrl = "https://www.efootballmarket.co.ke",
}: {
  listing: any;
  siteUrl?: string;
}) {
  const primaryImage =
    listing.images?.find((img: any) => img.is_primary)?.image_url ||
    listing.images?.[0]?.image_url ||
    `${siteUrl}/icon.svg`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description || `${listing.overall_team_strength} OVR eFootball Mobile Account with verified Konami ID.`,
    image: [primaryImage],
    brand: {
      "@type": "Brand",
      name: "eFootball",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/listings/${listing.id}`,
      priceCurrency: listing.currency || "KES",
      price: listing.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      itemCondition: "https://schema.org/UsedCondition",
      availability: listing.status === "published" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "eFootballMarket Kenya Escrow Vault",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
}

export function NewsArticleJsonLd({
  article,
  siteUrl = "https://www.efootballmarket.co.ke",
}: {
  article: any;
  siteUrl?: string;
}) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    image: article.cover_image_url ? [article.cover_image_url] : [`${siteUrl}/icon.svg`],
    datePublished: article.created_at,
    dateModified: article.updated_at || article.created_at,
    author: {
      "@type": "Person",
      name: article.author_name || "Brian Okibo",
      jobTitle: "Security & Escrow Officer",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "eFootballMarket Kenya",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/news/${article.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
    />
  );
}

export function HowToEscrowJsonLd({
  siteUrl = "https://www.efootballmarket.co.ke",
}: {
  siteUrl?: string;
}) {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Safely Buy and Transfer eFootball Accounts via M-Pesa Escrow in Kenya",
    description: "Step-by-step verified escrow procedure for eFootball peer-to-peer account transfers with Safaricom Till 1572931 and 24-hour buyer inspection protection.",
    totalTime: "PT30M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Deposit Funds to Escrow Till 1572931",
        text: "Buyer sends agreed payment to Safaricom Buy Goods Till 1572931 (EFootballMarket). Funds are locked into neutral escrow holding.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Encrypted Credential Transfer",
        text: "Seller provides Konami ID login and linked email details through the secure escrow platform.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "24-Hour Buyer Inspection Window",
        text: "Buyer logs into eFootball Mobile, inspects OVR strength, player cards, and changes the registered email and two-factor authentication (2FA).",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Payout Disbursement",
        text: "Buyer marks the order as fulfilled or 24 hours elapse with no dispute, releasing funds to the seller's M-Pesa account instantly.",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
  siteUrl = "https://www.efootballmarket.co.ke",
}: {
  items: { name: string; url: string }[];
  siteUrl?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
