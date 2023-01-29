import React from "react";
import { GetStaticProps, GetStaticPaths, GetStaticPropsContext } from "next";
import Head from "next/head";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

import { getPostPath, getPostProps } from "@/service";
import MarkdownRender from "@/components/MarkdownRender";

interface PostProps {
  title: string;
  date: string;
  tag: string[];
  excerpt: string;
  content: string;
}

export default function Post({
  title,
  date,
  tag,
  excerpt,
  content,
}: PostProps) {
  return (
    <div>
      <h1>{title}</h1>
      <p>{date}</p>
      {tag.map((tag, index) => (
        <span key={index}>{tag}</span>
      ))}
      <p>{excerpt}</p>
      <MarkdownRender content={content} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return getPostPath();
};
export const getStaticProps: GetStaticProps = async (
  context: GetStaticPropsContext
) => {
  return getPostProps(context);
};
