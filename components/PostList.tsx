"use client";

import { postListType } from "@/lib/posts";
import { useRouter } from "next/navigation";
import React from "react";
import TagList from "./TagList";

interface PostListProps {
  list: postListType[];
}

export default function PostList({ list }: PostListProps) {
  const router = useRouter();

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {list.map((post) => (
        <div
          key={post.slug}
          className="p-5 shadow-lg rounded-xl cursor-pointer hover:bg-blue-50"
          onClick={() => router.push(`/posts/${post.category}/${post.slug}`)}
        >
          <h3>{post.title}</h3>
          <p className="text-gray-400 text-sm m-0 mt-1">{post.date}</p>
          <p>{post.excerpt}</p>
          <TagList tags={post.tags} />
        </div>
      ))}
    </div>
  );
}
