import { postListType } from "@/lib/posts";
import React from "react";
import TagList from "./TagList";
import Link from "next/link";

interface PostListProps {
  list: postListType[];
}

export default function PostList({ list }: PostListProps) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {list.map((post) => (
        <div key={post.slug} className="p-5 shadow-lg rounded-xl">
          <Link href={`/post/${post.slug}`}>
            <h3>{post.title}</h3>
          </Link>
          <p className="text-gray-400 text-sm m-0 mt-1">{post.date}</p>
          <p>{post.excerpt}</p>
          <Link href={`/post/${post.slug}`}>
            <p className="text-gray-500 hover:font-bold">read more...</p>
          </Link>
          <TagList tags={post.tags} />
        </div>
      ))}
    </div>
  );
}
