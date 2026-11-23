import { getPostList } from "@/lib/posts";

export const dynamic = "force-static";

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);

export function GET() {
  const posts = getPostList();
  const items = posts.map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>https://waynechoi.dev/post/${post.slug}/</link>
      <guid isPermaLink="true">https://waynechoi.dev/post/${post.slug}/</guid>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"><channel>
  <title>WayneChoi.dev</title>
  <link>https://waynechoi.dev/</link>
  <description>Graphics programming, web development, and software engineering.</description>
  <language>en-nz</language>${items}
</channel></rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
