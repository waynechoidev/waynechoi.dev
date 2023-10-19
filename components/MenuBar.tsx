"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const menus = [
  { label: "About", link: "/about" },
  { label: "Posts", link: "/posts" },
];

export default function MenuBar() {
  const pathname = usePathname();
  return (
    <div className="flex justify-end">
      {menus.map((menu) => (
        <Link key={menu.label} href={menu.link}>
          <span
            className={`pl-3 text-lg ${
              menu.link.replaceAll("/", "") === pathname.replaceAll("/", "")
                ? "font-bold"
                : "font-normal"
            }`}
          >
            {menu.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
