import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "eFootballMarket - eFootball Account Escrow Marketplace",
    short_name: "eFootballMarket",
    description: "Kenya's #1 verified eFootball account trading platform with automated M-Pesa escrow protection.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d16",
    theme_color: "#090d16",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
