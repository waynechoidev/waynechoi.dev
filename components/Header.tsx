"use client";
import { MainAnimation } from "@/animation/main";
import Link from "next/link";
import React, { useEffect, useRef } from "react";

export default function Header() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    new MainAnimation(canvas.current!);
  }, []);

  return (
    <div className="h-32 relative" id="sky">
      <canvas className="w-full h-full" ref={canvas} />
      <div className="absolute top-0 inset-x-auto w-full ">
        <div className="w-full max-w-default mx-auto">
          <h1 className="text-4xl font-semibold p-5 pt-0">
            <Link href="/" className="text-blue-800">
              WayneChoi.dev
            </Link>
          </h1>
        </div>
      </div>
    </div>
  );
}
