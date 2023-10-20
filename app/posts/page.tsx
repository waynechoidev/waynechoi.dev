import CategoryBar from "@/components/CategoryBar";
import PostList from "@/components/PostList";
import { getPostList } from "@/lib/posts";

export default function Posts() {
  const { data, categoryList } = getPostList();
  return (
    <>
      <CategoryBar categoryList={categoryList} />
      <h2 className="pl-2">ALL POSTS</h2>
      <PostList list={data} />
    </>
  );
}
