import React, { Suspense } from "react";
import { getAllPosts } from "@/lib/posts";
import Container from "@/app/components/container";
import BlogListClient from "@/app/blog/BlogListClient";

export default async function Blog() {
  // Get posts directly using your existing function
  const posts = await getAllPosts();

  // Sort posts by date
  const sortedPosts = posts.sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
  );

  return (
    <main>
      <Container>
        <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-16 pt-24">
          <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
            Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {`I've written ${posts.length} articles on my blog. Use the search below to filter by title.`}
          </p>
          <div className="relative w-full mb-4">
            <input
              aria-label="Search articles"
              type="text"
              placeholder="Search articles"
              className="block w-full px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-md dark:border-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
            />
            <svg
              className="absolute right-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="h-px bg-border w-full my-8" />
          <Suspense fallback={<div>Loading...</div>}>
            <BlogListClient posts={sortedPosts} />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}
