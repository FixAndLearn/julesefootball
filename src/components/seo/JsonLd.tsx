import React from "react";

interface JsonLdProps {
  siteUrl: string;
}

export function JsonLd({ siteUrl }: JsonLdProps) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "eFootballMarket",
    alternateName: ["eFootball Market", "eFootball Kenya", "PES Market Kenya"],
    url: siteUrl,
    description:
      "Kenya's premier escrow marketplace for trading verified eFootball (PES) accounts with automated Safaricom M-Pesa STK Push protection.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/browse?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "eFootballMarket",
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    founder: {
      "@type": "Person",
      name: "Brian Okibo",
      jobTitle: "Chief Executive Officer (CEO)",
    },
    description:
      "Non-custodial escrow exchange connecting eFootball gamers across Kenya and East Africa for safe, verified Konami ID account handovers.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["English", "Swahili"],
    },
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
    </>
  );
}
