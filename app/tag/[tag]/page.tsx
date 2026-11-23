import PostList from "@/components/PostList";
import { getPostListByTag, getTags } from "@/lib/posts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ tag: string }> };

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const posts = getPostListByTag(tag);
  if (posts.length === 0) notFound();
  return <><h2>#{tag}</h2><PostList list={posts} /></>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag}`, description: `Posts tagged ${tag}`, alternates: { canonical: `/tag/${tag}/` } };
}

export const generateStaticParams = () => getTags().map((tag) => ({ tag }));
