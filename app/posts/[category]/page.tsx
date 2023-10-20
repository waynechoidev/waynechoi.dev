import CategoryBar from "@/components/CategoryBar";
import PostList from "@/components/PostList";
import { categoryList, getPostListByCategory } from "@/lib/posts";

export default function Post({ params }: { params: { category: string } }) {
  const posts = getPostListByCategory(params.category);
  return (
    <>
      <CategoryBar
        categoryList={categoryList}
        currentCategory={params.category}
      />
      <PostList list={posts} />
    </>
  );
}

export async function generateStaticParams() {
  return categoryList.map((category) => ({ category: category }));
}
