import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import { serialize } from "next-mdx-remote/serialize";
import MDXWrapper from "@/app/components/MDXWrapper";
import Container from "@/app/components/container";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import Image from "next/image";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Serialize the MDX content
  const mdxSource = await serialize(post.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, rehypeHighlight],
    },
  });

  return (
    <main>
      <Container>
        <article className="max-w-4xl mx-auto py-8">
          {/* Blog post header */}
          <header className="mb-8 pt-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              {post.metadata.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <time dateTime={post.metadata.date}>
                {new Date(post.metadata.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>

              {post.metadata.tags && post.metadata.tags.length > 0 && (
                <div className="flex gap-2">
                  {post.metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {post.metadata.image && (
              <Image
                src={post.metadata.image}
                alt={post.metadata.title}
                width={800}
                height={256}
                className="w-full h-64 object-cover rounded-lg mb-8"
              />
            )}
          </header>

          {/* Blog post content */}
          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
            <MDXWrapper source={mdxSource} />
          </div>
        </article>
      </Container>
    </main>
  );
}
