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

export const categoryList = ["graphics", "web", "cs", "story"];

export const getPostList = () => {
  const files = fs.readdirSync(path.join("posts"));

  const posts: postListType[] = files
    .map((filename) => {
      const slug = filename.replace(".md", "");

      const markdownWithMeta = fs.readFileSync(
        path.join("posts", filename),
        "utf-8"
      );

      const { data: frontMatter } = matter(markdownWithMeta);
      const { category, title, date, excerpt }: { [key: string]: string } =
        frontMatter;
      const { tags }: { [eky: string]: string[] } = frontMatter;

      return {
        category,
        slug,
        title,
        date,
        tags,
        excerpt,
      };
    })
    .sort((a, b): number => {
      return new Date(b.date!).getTime() - new Date(a.date!).getTime();
    });

  return posts;
};

export const getPostListByCategory = (category: string) => {
  return getPostList().filter((post) => post.category === category);
};

export const getPostListBySlugs = (slugs: string[]) => {
  const res: postListType[] = [];

  slugs.forEach((slug) => {
    const markdownWithMeta = fs.readFileSync(
      path.join("posts", slug + ".md"),
      "utf-8"
    );

    const { data: frontMatter } = matter(markdownWithMeta);
    const { title, date, tags, category, excerpt } = frontMatter;
    res.push({
      title,
      date,
      tags,
      category,
      slug,
      excerpt,
    });
  });

  return res;
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

export const getTags = () => {
  const posts = getPostList();
  const res: string[] = [];

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      if (!res.includes(tag)) {
        res.push(tag);
      }
    });
  });

  return res;
};

export const getPostListByTag = (tag: string) => {
  return getPostList().filter((post) => post.tags.includes(tag));
};
