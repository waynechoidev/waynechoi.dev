import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import Header from "@/components/Header";
import MenuBar from "@/components/MenuBar";

export const metadata: Metadata = {
  title: "WayneChoi.Dev",
  description: "Wayne Choi blog",
  icons: ["/favicon.ico"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="mx-auto my-0">
        <nav className="max-w-default mx-auto px-5 py-3">
          <MenuBar />
        </nav>
        <header>
          <Header />
        </header>
        <div className="max-w-default mx-auto p-5">{children}</div>
        <footer className="h-40 flex justify-center items-end">
          <p className="text-gray-500 text-sm">
            (C) 2021. Wayne Choi. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
