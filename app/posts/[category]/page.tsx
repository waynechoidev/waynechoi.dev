import CategoryBar from "@/components/CategoryBar";
import PostList from "@/components/PostList";
import { categoryList, getPostListByCategory } from "@/lib/posts";

export default function Post({ params }: { params: { category: string } }) {
  const posts = getPostListByCategory(params.category);

  const categoryIndex = categoryList.indexOf(params.category);
  const filtredList = [...categoryList];
  filtredList.unshift(filtredList.splice(categoryIndex, 1)[0]);

  return (
    <>
      <CategoryBar
        categoryList={filtredList}
        currentCategory={params.category}
      />
      <PostList list={posts} />
    </>
  );
}

export async function generateStaticParams() {
  return categoryList.map((category) => ({ category: category }));
}
