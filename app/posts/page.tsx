import { getPostList } from "@/service";
import Link from "next/link";

export default function Posts() {
  const posts = getPostList();
  return (
    <>
      {posts.map((post) => (
        <div key={post.slug}>
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </div>
      ))}
    </>
  );
}
