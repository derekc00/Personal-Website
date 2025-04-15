import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getMdxBySlug, getAllMdxFiles } from "@/lib/mdx";
import MDXContent from "@/app/components/MDXContent";
import { serialize } from "next-mdx-remote/serialize";

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getMdxBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found",
    };
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: "article",
      publishedTime: post.frontmatter.date,
      images: post.frontmatter.image
        ? [{ url: post.frontmatter.image }]
        : undefined,
    },
  };
}

// Generate static params for all posts
export async function generateStaticParams() {
  const posts = await getAllMdxFiles();
  return posts.map((post) => ({
    slug: post?.slug,
  }));
}

// The actual page component
export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getMdxBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Serialize the MDX content with proper options
  const serializedContent = await serialize(post.content, {
    mdxOptions: {
      development: process.env.NODE_ENV === "development",
    },
    parseFrontmatter: true,
  });

  // Format the date
  const date = new Date(post.frontmatter.date);
  const formattedDate = `${date.toLocaleString("en-US", {
    month: "long",
  })} ${date.getDate()}, ${date.getFullYear()}`;

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        {post.frontmatter.image && (
          <div className="mb-8 rounded-lg overflow-hidden relative h-64 md:h-96">
            <img
              src={post.frontmatter.image}
              alt={post.frontmatter.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="text-sm text-gray-500 mb-2">{formattedDate}</div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {post.frontmatter.title}
        </h1>

        {post.frontmatter.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.frontmatter.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>
      <Suspense fallback={<div>Loading content...</div>}>
        <MDXContent source={serializedContent} />
      </Suspense>
    </article>
  );
}
