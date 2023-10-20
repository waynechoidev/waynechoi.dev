import CategoryBar from "@/components/CategoryBar";
import PostList from "@/components/PostList";
import { getPostList } from "@/lib/posts";

export default function Post({ params }: { params: { category: string } }) {
  const { data, categoryList } = getPostList(params.category);
  return (
    <>
      <CategoryBar
        categoryList={categoryList}
        currentCategory={params.category}
      />
      <PostList list={data} />
    </>
  );
}

export async function generateStaticParams() {
  return getPostList().data.map((post) => ({ category: post.category }));
}
