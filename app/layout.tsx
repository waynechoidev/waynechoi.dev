import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import Header from "@/components/Header";
import MenuBar from "@/components/MenuBar";
import "highlight.js/styles/a11y-dark.css";

const siteUrl = "https://waynechoi.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "WayneChoi.dev", template: "%s | WayneChoi.dev" },
  description: "Wayne Choi's notes on graphics programming, web development, computer science, and software engineering.",
  icons: ["/favicon.ico"],
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { type: "website", siteName: "WayneChoi.dev", url: siteUrl },
  twitter: { card: "summary" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="mx-auto my-0">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <nav className="max-w-default mx-auto px-5 py-3" aria-label="Primary navigation">
          <MenuBar />
        </nav>
        <header>
          <Header />
        </header>
        <main id="main-content" className="max-w-default mx-auto p-5">{children}</main>
        <footer className="h-40 flex justify-center items-end">
          <p className="text-gray-500 text-sm">
            © 2021–{new Date().getFullYear()} Wayne Choi. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
