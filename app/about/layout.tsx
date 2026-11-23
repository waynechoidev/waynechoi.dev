import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Wayne Choi, a software engineer and graphics programming enthusiast in New Zealand.",
  alternates: { canonical: "/about/" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
