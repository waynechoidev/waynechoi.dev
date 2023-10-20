import Link from "next/link";
import React from "react";

interface TagListProps {
  tags: string[];
}

export default function TagList({ tags }: TagListProps) {
  return (
    <>
      {tags.map((tag) => (
        <Link
          href={`/tag/${tag}`}
          key={tag}
          className="mr-2 text-gray-500 hover:text-blue-800"
        >
          {`#${tag}`}
        </Link>
      ))}
    </>
  );
}
