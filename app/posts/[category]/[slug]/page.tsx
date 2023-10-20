import MarkdownRender from "@/components/MarkdownRender";
import { getPostData, getPostList } from "@/lib/posts";
import Link from "next/link";

export default function Post({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const { title, date, tags, content } = getPostData(params.slug);
  return (
    <div>
      <Link
        href={`/posts/${params.category}`}
        className="text-gray-600 text-lg pl-1 hover:text-blue-800"
      >
        {params.category}
      </Link>
      <h1>{title}</h1>
      <p>{date}</p>
      {tags.map((tag, index) => (
        <span key={index}>{tag}</span>
      ))}
      <MarkdownRender content={content} />
    </div>
  );
}

export async function generateStaticParams() {
  return getPostList().data.map((post) => ({
    category: post.category,
    slug: post.slug,
  }));
}
