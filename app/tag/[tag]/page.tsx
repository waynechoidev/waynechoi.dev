import PostList from "@/components/PostList";
import { getPostListByTag, getTags } from "@/lib/posts";

export default function Post({ params }: { params: { tag: string } }) {
  const data = getPostListByTag(params.tag);
  return (
    <>
      <h2>{`#${params.tag}`}</h2>
      <PostList list={data} />
    </>
  );
}

export async function generateStaticParams() {
  return getTags().map((tag) => ({ tag: tag }));
}
