import Link from "next/link";
import React from "react";

interface TagListProps {
  tags: string[];
}

export default function TagList({ tags }: TagListProps) {
  return (
    <div className="whitespace-nowrap overflow-x-auto pb-2" aria-label="Post tags">
      {tags.map((tag) => (
        <Link
          href={`/tag/${tag}`}
          key={tag}
          className="mr-2 text-gray-600 hover:text-blue-800 hover:underline"
        >
          {`#${tag}`}
        </Link>
      ))}
    </div>
  );
}
