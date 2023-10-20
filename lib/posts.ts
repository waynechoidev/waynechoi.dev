import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type postListType = {
  category: string;
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
};

export type postDataType = {
  title: string;
  date: string;
  tags: string[];
  content: string;
};

export const categoryList = ["Web", "Web Graphics", "Native Graphics", "CS"];

export const getPostList = (category?: string) => {
  const files = fs.readdirSync(path.join("posts"));
  const categoryList: string[] = [];
  const posts: postListType[] = files.map((filename) => {
    const slug = filename.replace(".md", "");

    const markdownWithMeta = fs.readFileSync(
      path.join("posts", filename),
      "utf-8"
    );

    const { data: frontMatter } = matter(markdownWithMeta);
    const { category, title, date, excerpt }: { [key: string]: string } =
      frontMatter;
    const { tags }: { [eky: string]: string[] } = frontMatter;

    if (!categoryList.includes(category)) {
      categoryList.push(category);
    }

    return {
      category,
      slug,
      title,
      date,
      tags,
      excerpt,
    };
  });

  return {
    categoryList: categoryList.sort(),
    data: posts
      .sort((a, b): number => {
        return new Date(b.date!).getTime() - new Date(a.date!).getTime();
      })
      .filter((post) => (category ? post.category === category : true)),
  };
};

export const getPostData = (slug: string) => {
  const markdownWithMeta = fs.readFileSync(
    path.join("posts", slug + ".md"),
    "utf-8"
  );

  const { data: frontMatter, content } = matter(markdownWithMeta);
  const { title, date, tags } = frontMatter;
  const res: postDataType = { title, date, tags, content };
  return res;
};
