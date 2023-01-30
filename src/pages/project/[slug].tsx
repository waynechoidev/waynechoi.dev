import React from "react";
import { GetStaticProps, GetStaticPaths, GetStaticPropsContext } from "next";
import Head from "next/head";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

import { getPostPath, getPostProps, getProjectPath } from "@/service";
import MarkdownRender from "@/components/MarkdownRender";

interface PostProps {
  content: string;
}

export default function Post({ content }: PostProps) {
  return (
    <div>
      <MarkdownRender content={content} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return getProjectPath();
};
export const getStaticProps: GetStaticProps = async (
  context: GetStaticPropsContext
) => {
  return getPostProps(context);
};
