import Link from "next/link";
import React from "react";

interface TagListProps {
  tags: string[];
}

export default function TagList({ tags }: TagListProps) {
  return (
    <>
      {tags.map((tag) => (
        <Link href="" key={tag} className="mr-2 text-gray-500">
          {`#${tag}`}
        </Link>
      ))}
    </>
  );
}
