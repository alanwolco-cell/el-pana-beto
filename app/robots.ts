import type { MetadataRoute } from "next";

// No bloqueamos /r/ aquí: Twitterbot respeta robots.txt y rompería los
// previews de reportes compartidos. La privacidad de /r/ va por noindex
// en la propia página.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: "https://elpanabeto.com/sitemap.xml",
  };
}
