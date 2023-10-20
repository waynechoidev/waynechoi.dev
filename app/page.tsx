import PostList from "@/components/PostList";
import { getPostListBySlugs } from "@/lib/posts";

export default function Home() {
  const webGraphicsPosts = getPostListBySlugs([
    "webgl-particles",
    "ray-tracing-on-canvas",
  ]);
  const webPosts = getPostListBySlugs(["web-based-deep-learning"]);
  return (
    <div className="flex flex-col space-y-12">
      <div>
        <h2>Web graphics</h2>
        <PostList list={webGraphicsPosts} />
      </div>
      <div>
        <h2>Web</h2>
        <PostList list={webPosts} />
      </div>
    </div>
  );
}
