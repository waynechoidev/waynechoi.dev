import MarkdownRender from "@/components/MarkdownRender";
import TagList from "@/components/TagList";
import { getPostData, getPostList } from "@/lib/posts";
import Link from "next/link";

export default function Post({ params }: { params: { slug: string } }) {
  const { title, date, tags, content, category } = getPostData(params.slug);
  return (
    <div>
      <Link
        href={`/posts/${category}`}
        className="text-gray-600 text-md pl-1 hover:text-blue-800 font-semibold"
      >
        {category.toUpperCase()}
      </Link>
      <h1>{title}</h1>
      <p className="text-gray-400 text-sm m-0 mt-1">{date}</p>
      <div className="mt-1">
        <TagList tags={tags} />
      </div>
      <div className="mt-8">
        <MarkdownRender content={content} />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return getPostList().map((post) => ({
    slug: post.slug,
  }));
}
