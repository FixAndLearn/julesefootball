import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://www.efootballmarket.co.ke";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/dashboard/",
          "/orders/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/dashboard/",
          "/orders/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
