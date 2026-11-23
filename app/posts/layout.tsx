import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Posts",
  description: "Articles about graphics programming, web development, computer science, and software engineering.",
  alternates: { canonical: "/posts/" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
