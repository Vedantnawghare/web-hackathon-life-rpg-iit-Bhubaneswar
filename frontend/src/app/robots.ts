import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup"],
        disallow: [
          "/dashboard",
          "/quests",
          "/character",
          "/inventory",
          "/shop",
          "/achievements",
          "/history",
          "/settings",
          "/onboarding",
          "/api/",
        ],
      },
    ],
    sitemap: "https://life-rpg-pi-silk.vercel.app/sitemap.xml",
  };
}
