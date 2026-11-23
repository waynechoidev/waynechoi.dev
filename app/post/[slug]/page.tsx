import Comment from "@/components/Comment";
import MarkdownRender from "@/components/MarkdownRender";
import TagList from "@/components/TagList";
import { formatPostDate, getPostData, getPostList } from "@/lib/posts";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function Post({ params }: Props) {
  const { slug } = await params;
  const post = getPostData(slug);
  if (!post) notFound();

  const { title, date, tags, content, category, excerpt } = post;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt,
    datePublished: date,
    author: { "@type": "Person", name: "Wayne Choi" },
    mainEntityOfPage: `https://waynechoi.dev/post/${slug}/`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link href={`/posts/${category}`} className="text-gray-600 hover:text-blue-800 hover:underline">
        {category.toUpperCase()}
      </Link>
      <h1>{title}</h1>
      <time dateTime={date} className="text-gray-500 text-sm">{formatPostDate(date)}</time>
      <div className="mt-2"><TagList tags={tags} /></div>
      <div className="mt-8"><MarkdownRender content={content} /></div>
      <Comment issueTerm={title} />
    </article>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostData(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/post/${slug}/` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/post/${slug}/`,
      publishedTime: post.date,
      tags: post.tags,
      images: [{ url: "/opengraph-image", alt: "WayneChoi.dev" }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ["/twitter-image"],
    },
  };
}

export function generateStaticParams() {
  return getPostList().map((post) => ({ slug: post.slug }));
}
