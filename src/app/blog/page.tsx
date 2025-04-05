// src/app/blog/page.tsx (Server Component)
import { getAllPosts } from "@/lib/posts";
import Card from "@/app/components/card";
import Container from "@/app/components/container";
import ClientSideFilter from "@/app/components/client-side-filter"; // We'll create this

export default async function Blog({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
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

  // Pre-filter posts if tag is in URL
  const selectedTag = (await searchParams).tag || null;
  const filteredPosts = selectedTag
    ? sortedPosts.filter((post) => post.metadata.tags.includes(selectedTag))
    : sortedPosts;

  return (
    <Container>
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Blog
            </h1>

            {/* Move the client-side tag filtering to a separate component */}
            <ClientSideFilter allTags={allTags} selectedTag={selectedTag} />
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
                {selectedTag
                  ? `No posts with the tag "${selectedTag}". Try selecting a different tag.`
                  : "No blog posts available at the moment."}
              </p>
            </div>
          )}
        </div>
      </main>
    </Container>
  );
}
