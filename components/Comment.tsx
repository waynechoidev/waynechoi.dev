"use client";
import { useEffect, useRef } from "react";

export default function Comment({ issueTerm }: { issueTerm: string }) {
  const commentsEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commentsEl.current?.children.length === 0) {
      const scriptEl = document.createElement("script");
      scriptEl.async = true;
      scriptEl.src = "https://utteranc.es/client.js";
      scriptEl.setAttribute("repo", "waynechoidev/waynechoi.dev");
      scriptEl.setAttribute("issue-term", issueTerm);
      scriptEl.setAttribute("theme", "github-light");
      scriptEl.setAttribute("crossorigin", "anonymous");
      commentsEl.current?.appendChild(scriptEl);
    }
  }, [issueTerm]);

  return (
    <div>
      <div ref={commentsEl} />
    </div>
  );
}
