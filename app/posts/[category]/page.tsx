import CategoryBar from "@/components/CategoryBar";
import PostList from "@/components/PostList";
import { getPostList, getPostListByCategory } from "@/lib/posts";

export default function Post({ params }: { params: { category: string } }) {
  const { data, categoryList } = getPostListByCategory(params.category);
  return (
    <>
      <CategoryBar
        categoryList={categoryList}
        currentCategory={params.category}
      />
      <h2 className="pl-2">
        {params.category.replaceAll("_", " ").toUpperCase()}
      </h2>
      <PostList list={data} />
    </>
  );
}

export async function generateStaticParams() {
  return getPostList().data.map((post) => ({ category: post.category }));
}
