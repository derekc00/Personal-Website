"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/BlogCard";
import { ContentItem } from "@/lib/content";
import ContentFilter from "./ContentFilter";

interface ContentPageClientProps {
  initialContent: ContentItem[];
  categories: string[];
}

export default function ContentPageClient({
  initialContent,
  categories,
}: ContentPageClientProps) {
  const [filteredContent, setFilteredContent] = useState(initialContent);
  const [visibleCount, setVisibleCount] = useState(9);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredContent(initialContent);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = initialContent.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.excerpt.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );
    setFilteredContent(filtered);
    setVisibleCount(9);
  };

  const handleCategorySelect = (category: string | null) => {
    if (!category) {
      setFilteredContent(initialContent);
      return;
    }

    const filtered = initialContent.filter(
      (item) => item.category === category
    );
    setFilteredContent(filtered);
    setVisibleCount(9);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  const visibleContent = filteredContent.slice(0, visibleCount);
  const hasMore = visibleCount < filteredContent.length;

  return (
    <div className="min-h-screen flex flex-col pt-16">
      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6">
            Projects & Blog Posts
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Exploring technology, design, and development through my work and
            writing.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <ContentFilter
        categories={categories}
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
      />

      {/* Content Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleContent.map((item) => (
              <BlogCard key={item.id} post={item} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-12 text-center">
              <Button
                onClick={handleLoadMore}
                className="rounded-full px-8 py-6 h-auto bg-gray-100 text-gray-900 hover:bg-gray-200 border-0"
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
