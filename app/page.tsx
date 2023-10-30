import PostList from "@/components/PostList";
import { getPostListBySlugs } from "@/lib/posts";

export default function Home() {
  const posts = getPostListBySlugs([
    "image-based-lighting",
    "sphere-texture-mapping",
    "webgl-particles",
    "web-based-deep-learning",
  ]);
  return (
    <div>
      <h2 className="pl-3 my-2">Pinned</h2>
      <PostList list={posts} />
    </div>
  );
}
