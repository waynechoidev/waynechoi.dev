import CategoryBar from "@/components/CategoryBar";
import PostList from "@/components/PostList";
import { categoryList, getPostList } from "@/lib/posts";

export default function Posts() {
  const posts = getPostList();
  console.log(categoryList);
  return (
    <>
      <CategoryBar categoryList={categoryList} />
      <PostList list={posts} />
    </>
  );
}
