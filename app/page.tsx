import PostList from "@/components/PostList";
import { getPostListBySlugs } from "@/lib/posts";
import Link from "next/link";

export default function Home() {
  const webGraphicsPosts = getPostListBySlugs([
    "webgl-particles",
    "ray-tracing-on-canvas",
  ]);
  const webPosts = getPostListBySlugs(["web-based-deep-learning"]);
  return (
    <div className="flex flex-col space-y-12">
      <div>
        <Link href="/posts/web_graphics">
          <h2>Web graphics</h2>
        </Link>
        <PostList list={webGraphicsPosts} />
      </div>
      <div>
        <Link href="/posts/web">
          <h2>Web</h2>
        </Link>
        <PostList list={webPosts} />
      </div>
    </div>
  );
}
