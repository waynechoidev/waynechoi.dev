import { categoryList, getPostList, getTags } from "@/lib/posts";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = "https://waynechoi.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/posts"].map((route) => ({ url: `${siteUrl}${route}/`, changeFrequency: "monthly" as const }));
  const categories = categoryList.map((category) => ({ url: `${siteUrl}/posts/${category}/`, changeFrequency: "monthly" as const }));
  const tags = getTags().map((tag) => ({ url: `${siteUrl}/tag/${tag}/`, changeFrequency: "monthly" as const }));
  const posts = getPostList().map((post) => ({ url: `${siteUrl}/post/${post.slug}/`, lastModified: post.date, changeFrequency: "yearly" as const }));
  return [...staticRoutes, ...categories, ...tags, ...posts];
}
