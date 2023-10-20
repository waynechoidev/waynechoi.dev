import PostList from "@/components/PostList";
import { getPostListBySlugs } from "@/lib/posts";

export default function Home() {
  const posts = getPostListBySlugs([
    "webgl-particles",
    "ray-tracing-on-canvas",
    "web-based-deep-learning",
  ]);
  return (
    <div>
      <h2 className="pl-2">Pinned</h2>
      <PostList list={posts} />
    </div>
  );
}
