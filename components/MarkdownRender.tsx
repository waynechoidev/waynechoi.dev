"use client";

import React, { useRef, useEffect } from "react";
import highlightJs from "highlight.js";
import "highlight.js/styles/a11y-dark.css";
import { marked } from "marked";

interface MarkdownRenderProps {
  content: string;
}

export default function MarkdownRender({ content }: MarkdownRenderProps) {
  const postRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    postRef.current!.innerHTML = marked(content);
    postRef
      .current!.querySelectorAll<HTMLElement>("pre code")
      .forEach((block) => {
        highlightJs.highlightElement(block);
      });
    postRef
      .current!.querySelectorAll<HTMLAnchorElement>("a")
      .forEach((link) => {
        link.target = "_blank";
        link.id = "md-link";
      });
  }, [content]);
  return <div className="flex flex-col justify-center" ref={postRef}></div>;
}
