import ReactMarkdown from "react-markdown";
import { getPostBySlug } from "../../../lib/posts";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Post({ params }: Props) {
  const slug = (await params).slug; // Wait for the Promise to resolve

  const post = getPostBySlug(slug); // Call the function synchronously

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">{post.metadata.title}</h1>
      <div className="max-w-3xl">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </main>
  );
}
