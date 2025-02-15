import ReactMarkdown from "react-markdown";
import { getPostBySlug } from "@/lib/posts";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Post({ params }: Props) {
  const slug = (await params).slug;
  const post = getPostBySlug(slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">{post.metadata.title}</h1>
      <p className="text-gray-600 mb-4">{post.metadata.date}</p>
      <div className="max-w-3xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={{
            h1: ({ ...props }) => (
              <h1 className="text-3xl font-bold my-4" {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 className="text-2xl font-bold my-3" {...props} />
            ),
            h3: ({ ...props }) => (
              <h3 className="text-xl font-bold my-2" {...props} />
            ),
            ul: ({ ...props }) => (
              <ul className="list-disc list-inside my-4" {...props} />
            ),
            ol: ({ ...props }) => (
              <ol className="list-decimal list-inside my-4" {...props} />
            ),
            li: ({ ...props }) => <li className="ml-4" {...props} />,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </main>
  );
}
