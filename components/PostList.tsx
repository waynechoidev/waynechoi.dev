import { formatPostDate, type PostListItem } from "@/lib/posts";
import React from "react";
import TagList from "./TagList";
import Link from "next/link";

interface PostListProps {
  list: PostListItem[];
}

export default function PostList({ list }: PostListProps) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {list.map((post) => (
        <article key={post.slug} className="relative p-5 shadow-lg rounded-xl transition hover:-translate-y-0.5 hover:shadow-xl">
          <Link href={`/post/${post.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none" aria-label={`Read ${post.title}`}>
            <h3 className="m-0">{post.title}</h3>
          </Link>
          <time dateTime={post.date} className="text-gray-500 text-sm mt-1 block">{formatPostDate(post.date)}</time>
          <p>{post.excerpt}</p>
          <span className="text-gray-600">Read more <span aria-hidden="true">→</span></span>
          <div className="relative z-10 mt-3"><TagList tags={post.tags} /></div>
        </article>
      ))}
    </div>
  );
}
