import PostList from "@/components/PostList";
import { getPostListBySlugs } from "@/lib/posts";
import Link from "next/link";

export default function Home() {
  const posts = getPostListBySlugs([
    "n-body-problem",
    "terrain",
    "fast-fluid-dynamics-simulation",
    "pbr-rendering",
    "introduce-to-webgpu",
    "from-1-year-of-development-to-launch",
    "sph-water",
    "sphere-texture-mapping",
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
