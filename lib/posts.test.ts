import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { categoryList, getFeaturedPosts, getPostData, getPostList } from "./posts";

describe("post content", () => {
  it("loads every post with validated metadata", () => {
    const posts = getPostList();
    expect(posts.length).toBeGreaterThan(0);
    expect(new Set(posts.map((post) => post.slug)).size).toBe(posts.length);
    for (const post of posts) {
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(categoryList).toContain(post.category);
      expect(post.tags.length).toBeGreaterThan(0);
    }
  });

  it("keeps featured posts in frontmatter", () => {
    expect(getFeaturedPosts()).toHaveLength(9);
  });

  it("rejects unsafe or missing slugs", () => {
    expect(getPostData("../package")).toBeUndefined();
    expect(getPostData("does-not-exist")).toBeUndefined();
  });

  it("does not reference missing local images", () => {
    for (const post of getPostList()) {
      const content = getPostData(post.slug)!.content;
      for (const [, source] of content.matchAll(/<img[^>]+src=["'](\/[^"']+)["']/g)) {
        expect(fs.existsSync(path.join(process.cwd(), "public", source))).toBe(true);
      }
    }
  });
});
