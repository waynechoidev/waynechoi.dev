import Link from "next/link";
import React from "react";

export default function Header() {
  return (
    <div className="flex h-32 items-center">
      <h1 className="text-4xl font-semibold">
        <Link href="/" className="text-white">
          WayneChoi.dev
        </Link>
      </h1>
    </div>
  );
}
