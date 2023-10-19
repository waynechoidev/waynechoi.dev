import MarkdownRender from "@/components/MarkdownRender";
import { getPostData, getPostList } from "@/service";

export default function Post({ params }: { params: { slug: string } }) {
  const { title, date, tags, content } = getPostData(params.slug);

  return (
    <div>
      <h1>{title}</h1>
      <p>{date}</p>
      {tags.map((tag, index) => (
        <span key={index}>{tag}</span>
      ))}
      <MarkdownRender content={content} />
    </div>
  );
}

export async function generateStaticParams() {
  return getPostList();
}
