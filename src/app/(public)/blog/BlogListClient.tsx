"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import BlogCard from "@/components/BlogCard";

import type { ContentItem } from "@/lib/schemas";

export default function BlogListClient({ posts }: { posts: ContentItem[] }) {
  const searchParams = useSearchParams();
  const tagsParam = searchParams.get("tags");
  const activeTags = tagsParam ? tagsParam.split(",").filter(Boolean) : [];

  // Filter posts if tags are selected (show posts that have ANY of the selected tags)
  const filteredPosts =
    activeTags.length > 0
      ? posts.filter((post) =>
          post.tags.some((tag) => activeTags.includes(tag))
        )
      : posts;

  return filteredPosts.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPosts.map((post) => (
        <BlogCard
          key={post.slug}
          post={post}
        />
      ))}
    </div>
  ) : (
    <div className="text-center py-20">
      <h3 className="text-xl font-medium mb-2">No posts found</h3>
      <p className="text-muted-foreground">
        {activeTags.length > 0
          ? `No posts found with the selected tags. Try selecting different tags.`
          : "No blog posts available at the moment."}
      </p>
    </div>
  );
}
