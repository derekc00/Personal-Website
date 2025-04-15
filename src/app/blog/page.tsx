import React from "react";
import { getAllPosts } from "@/lib/posts";
import Card from "@/app/components/card";
import Container from "@/app/components/container";
import ClientSideFilter from "@/app/components/client-side-filter";

export default async function Blog({
  searchParams,
}: {
  searchParams: { tags?: string };
}) {
  // Get posts directly using your existing function
  const posts = getAllPosts();

  // Sort posts by date
  const sortedPosts = posts.sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
  );

  // Extract all unique tags
  const allTags = Array.from(
    new Set(sortedPosts.flatMap((post) => post.metadata.tags))
  );

  // Get active tags from URL
  const activeTags = searchParams.tags?.split(",").filter(Boolean) || [];

  // Filter posts if tags are selected (show posts that have ANY of the selected tags)
  const filteredPosts =
    activeTags.length > 0
      ? sortedPosts.filter((post) =>
          post.metadata.tags.some((tag) => activeTags.includes(tag))
        )
      : sortedPosts;

  return (
    <Container>
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col space-y-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Blog
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Explore our latest articles and insights
            </p>

            {/* Tag filtering component */}
            <ClientSideFilter
              allTags={allTags}
              selectedTag={activeTags[0] || null}
            />
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-800 w-full my-8" />

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(({ slug, metadata }) => (
                <Card
                  key={slug}
                  slug={slug}
                  title={metadata.title}
                  date={metadata.date}
                  image={metadata.image}
                  tags={metadata.tags}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No posts found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {activeTags.length > 0
                  ? `No posts found with the selected tags. Try selecting different tags.`
                  : "No blog posts available at the moment."}
              </p>
            </div>
          )}
        </div>
      </main>
    </Container>
  );
}
