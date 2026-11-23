import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { z } from "zod";

export const categoryList = ["graphics", "web", "cs", "story"] as const;

const postMetadataSchema = z.object({
  title: z.string().min(1),
  date: z.iso.date(),
  category: z.enum(categoryList),
  tags: z.array(z.string().min(1)).min(1),
  excerpt: z.string().min(1),
  featured: z.boolean().optional().default(false),
});

type PostMetadata = z.infer<typeof postMetadataSchema>;
export type PostListItem = PostMetadata & { slug: string };
export type PostData = PostMetadata & { slug: string; content: string };

const postsDirectory = path.join(process.cwd(), "posts");
const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

function readPostFile(slug: string): PostData {
  const source = fs.readFileSync(path.join(postsDirectory, `${slug}.md`), "utf8");
  const match = source.match(frontmatterPattern);
  if (!match) throw new Error(`Missing frontmatter in posts/${slug}.md`);

  const result = postMetadataSchema.safeParse(parse(match[1]));
  if (!result.success) {
    throw new Error(
      `Invalid frontmatter in posts/${slug}.md:\n${z.prettifyError(result.error)}`,
    );
  }

  return { ...result.data, slug, content: source.slice(match[0].length) };
}

export function getPostList(): PostListItem[] {
  return fs
    .readdirSync(postsDirectory)
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => readPostFile(filename.slice(0, -3)))
    .map((post) => ({
      title: post.title,
      date: post.date,
      category: post.category,
      tags: post.tags,
      excerpt: post.excerpt,
      featured: post.featured,
      slug: post.slug,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const getFeaturedPosts = () => getPostList().filter((post) => post.featured);
export const getPostListByCategory = (category: string) => getPostList().filter((post) => post.category === category);

export function getPostData(slug: string): PostData | undefined {
  if (!/^[a-z0-9-]+$/.test(slug)) return undefined;
  return fs.existsSync(path.join(postsDirectory, `${slug}.md`)) ? readPostFile(slug) : undefined;
}

export const getTags = () => [...new Set(getPostList().flatMap((post) => post.tags))].sort();
export const getPostListByTag = (tag: string) => getPostList().filter((post) => post.tags.includes(tag));

export function formatPostDate(date: string): string {
  return new Intl.DateTimeFormat("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
