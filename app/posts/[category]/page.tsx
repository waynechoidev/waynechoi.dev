import CategoryBar from "@/components/CategoryBar";
import PostList from "@/components/PostList";
import { categoryList, getPostListByCategory } from "@/lib/posts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ category: string }> };

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!categoryList.includes(category as (typeof categoryList)[number])) notFound();

  return (
    <>
      <CategoryBar categoryList={[...categoryList]} currentCategory={category} />
      <PostList list={getPostListByCategory(category)} />
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  return { title: `${category.toUpperCase()} posts`, alternates: { canonical: `/posts/${category}/` } };
}

export const generateStaticParams = () => categoryList.map((category) => ({ category }));
