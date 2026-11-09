import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/content/blog";
import { SOLUTIONS } from "@/lib/content/solutions";
import { SITE } from "@/lib/site";

const STATIC = ["", "/features", "/how-it-works", "/pricing", "/showcase", "/faq", "/about", "/contact", "/changelog", "/blog", "/help", "/terms", "/privacy", "/refund-policy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...STATIC, ...SOLUTIONS.map((s) => `/solutions/${s.slug}`), ...POSTS.map((p) => `/blog/${p.slug}`)];
  return paths.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: p === "" ? "weekly" : "monthly", priority: p === "" ? 1 : p === "/pricing" ? 0.9 : 0.7 }));
}
