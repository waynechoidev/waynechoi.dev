import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { GetStaticPropsContext } from "next";
import { projectList } from "@/constant";

export const getBlogList = () => {
  const files = fs.readdirSync(path.join("posts"));

  const posts = files.map((filename) => {
    const slug = filename.replace(".md", "");

    const markdownWithMeta = fs.readFileSync(
      path.join("posts", filename),
      "utf-8"
    );

    const { data: frontMatter, content } = matter(markdownWithMeta);
    const { title, date, excerpt }: { [key: string]: string } = frontMatter;
    const { tag }: { [eky: string]: string[] } = frontMatter;

    return {
      slug,
      title,
      date,
      tag,
      excerpt,
      // content
    };
  });

  return posts.sort((a, b): number => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

export const getPostPath = () => {
  const files = fs.readdirSync(path.join("posts"));

  const paths = files.map((filename) => ({
    params: {
      slug: filename.replace(".md", ""),
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getPostProps = (context: GetStaticPropsContext) => {
  const slug = context.params?.slug;
  const markdownWithMeta = fs.readFileSync(
    path.join("posts", slug + ".md"),
    "utf-8"
  );

  const { data: frontMatter, content } = matter(markdownWithMeta);
  const { title, date, tag, excerpt } = frontMatter;
  return {
    props: { title, date, tag, excerpt, content },
  };
};

export const getProjectPath = () => {
  const paths = projectList.map((project) => ({
    params: {
      slug: project.slug,
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getProjectProps = async (context: GetStaticPropsContext) => {
  const slug = context.params?.slug;

  const project = projectList.find((project) => project.slug === slug);
  if (!project) return;

  const response = await fetch(project.markdown);
  const markdownWithMeta = await response.text();
  const { content } = matter(markdownWithMeta);
  return {
    props: { content },
  };
};
