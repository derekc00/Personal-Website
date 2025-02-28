import { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import Container from "@/app/components/container";
import { Post } from "@/utils/types";

type Props = {
  params: { slug: string };
};

// Fetch post from API
async function getPost(slug: string): Promise<Post | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/posts?slug=${slug}`,
      {
        next: { revalidate: 60 }, // Revalidate every minute
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching post with slug "${slug}":`, error);
    return null;
  }
}

// Fetch all posts from API
async function getAllPostSlugs(): Promise<string[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/posts`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      return [];
    }

    const posts = await response.json();
    return posts.map((post: Post) => post.slug);
  } catch (error) {
    console.error("Error fetching post slugs:", error);
    return [];
  }
}

// Generate metadata for the post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found",
    };
  }

  return {
    title: post.metadata.title,
    description: `Read ${
      post.metadata.title
    } - a blog post about ${post.metadata.tags.join(", ")}`,
    openGraph: {
      title: post.metadata.title,
      description: `Read ${
        post.metadata.title
      } - a blog post about ${post.metadata.tags.join(", ")}`,
      type: "article",
      publishedTime: post.metadata.date,
      images: post.metadata.image ? [{ url: post.metadata.image }] : undefined,
    },
  };
}

// Generate static paths for all posts
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

async function PostContent({ slug }: { slug: string }) {
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The blog post you're looking for doesn't exist.
        </p>
        <Link
          href="/blog"
          className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  // Format the date with consistent formatting on server
  const date = new Date(post.metadata.date);
  const formattedDate = `${date.toLocaleString("en-US", {
    month: "long",
  })} ${date.getDate()}, ${date.getFullYear()}`;

  // Calculate read time with consistent calculation on server
  const readTime =
    post.content.split(/\s+/).length > 200
      ? `${Math.ceil(post.content.split(/\s+/).length / 200)} min read`
      : "1 min read";

  return (
    <article className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Hero section with image */}
        {post.metadata.image && (
          <div className="mb-8 rounded-lg overflow-hidden relative h-64 md:h-96">
            <Image
              src={post.metadata.image}
              alt={post.metadata.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Post header */}
        <header className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <time dateTime={post.metadata.date}>{formattedDate}</time>
            <span>•</span>
            <span>{readTime}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.metadata.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.metadata.tags.map((tag, index) => (
              <Link
                key={index}
                href={`/blog?tag=${tag}`}
                className="inline-block px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </header>

        {/* Post content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
            components={{
              h1: ({ ...props }) => (
                <h1
                  className="text-2xl md:text-3xl font-bold mt-8 mb-4"
                  {...props}
                />
              ),
              h2: ({ ...props }) => (
                <h2
                  className="text-xl md:text-2xl font-bold mt-6 mb-3"
                  {...props}
                />
              ),
              h3: ({ ...props }) => (
                <h3
                  className="text-lg md:text-xl font-bold mt-4 mb-2"
                  {...props}
                />
              ),
              p: ({ node, children, ...props }) => {
                // Check if this paragraph contains only an image
                const hasOnlyImage =
                  node?.children?.length === 1 &&
                  node?.children[0]?.type === "element" &&
                  node?.children[0]?.tagName === "img";

                // If it only contains an image, don't render the paragraph wrapper
                if (hasOnlyImage) {
                  return <>{children}</>;
                }

                // Otherwise render a normal paragraph
                return (
                  <p
                    className="my-4 text-gray-800 dark:text-gray-200"
                    {...props}
                  >
                    {children}
                  </p>
                );
              },
              a: ({ ...props }) => (
                <a
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  {...props}
                />
              ),
              ul: ({ ...props }) => (
                <ul className="list-disc list-outside my-4 ml-6" {...props} />
              ),
              ol: ({ ...props }) => (
                <ol
                  className="list-decimal list-outside my-4 ml-6"
                  {...props}
                />
              ),
              li: ({ ...props }) => <li className="my-1" {...props} />,
              blockquote: ({ ...props }) => (
                <blockquote
                  className="pl-4 border-l-4 border-gray-300 dark:border-gray-700 italic my-4"
                  {...props}
                />
              ),
              img: ({ alt, src, ...props }) => {
                // Create a standalone figure element that won't be wrapped in a paragraph
                return (
                  <figure className="my-6">
                    <img
                      src={src}
                      alt={alt}
                      className="rounded-lg max-w-full mx-auto"
                      {...props}
                    />
                    {alt && (
                      <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {alt}
                      </figcaption>
                    )}
                  </figure>
                );
              },
              code: ({ ...props }) => (
                <code
                  className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm"
                  {...props}
                />
              ),
              pre: ({ ...props }) => (
                <pre
                  className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"
                  {...props}
                />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Back to blog link */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
          >
            <svg
              className="mr-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to all posts
          </Link>
        </div>
      </div>
    </article>
  );
}

// Main component with Suspense
export default function PostContainer({ params }: Props) {
  return (
    <Container>
      <Suspense
        fallback={
          <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
            <div className="animate-pulse space-y-8 w-full max-w-3xl">
              <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        }
      >
        <PostContent slug={params.slug} />
      </Suspense>
    </Container>
  );
}
