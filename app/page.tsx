import PostList from "@/components/PostList";
import { getPostListBySlugs } from "@/lib/posts";
import Link from "next/link";

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
      <Link href="/posts">
        <p className="hover:font-bold text-xl ml-2 mt-8 font-mormal">
          more posts...
        </p>
      </Link>
    </div>
  );
}
