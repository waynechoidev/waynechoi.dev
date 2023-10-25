import { formatPascal } from "@/lib/utils";
import Link from "next/link";
import React from "react";

interface CategoryBarProps {
  currentCategory?: string;
  categoryList: string[];
}

export default function CategoryBar({
  currentCategory,
  categoryList,
}: CategoryBarProps) {
  return (
    <div className="overflow-x-auto sm:overflow-x-hidden pb-3 sm:pb-0">
      <CategoryItem category="all" highlight={!currentCategory} link="/posts" />
      {categoryList.map((category) => (
        <CategoryItem
          key={category}
          category={category}
          highlight={category === currentCategory}
          link={`/posts/${category}`}
        />
      ))}
    </div>
  );
}

function CategoryItem({
  category,
  highlight,
  link,
}: {
  category: string;
  highlight: boolean;
  link: string;
}) {
  return (
    <Link key={category} href={link}>
      <span
        className={`hover:font-bold px-2 text-md sm:text-lg ${
          highlight ? "font-bold" : "font-normal"
        }`}
      >
        {category.toUpperCase()}
      </span>
    </Link>
  );
}
