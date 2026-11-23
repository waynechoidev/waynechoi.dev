import { renderMarkdown } from "@/lib/markdown";

export default function MarkdownRender({ content }: { content: string }) {
  return <div className="post-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />;
}
