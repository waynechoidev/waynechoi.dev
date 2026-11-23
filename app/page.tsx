import PostList from "@/components/PostList";
import { getFeaturedPosts } from "@/lib/posts";
import Link from "next/link";

export default function Home() {
  const posts = getFeaturedPosts();
  return (
    <div>
      <h2 className="pl-3 my-2">Pinned</h2>
      <PostList list={posts} />
      <Link href="/posts" className="inline-block text-xl ml-2 mt-8 hover:underline">
        More posts <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
