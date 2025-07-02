import React, { Suspense } from "react";
import { getContentByType } from "@/lib/content";
import BlogListClient from "./BlogListClient";
import { PageLayout, PageHeader, Section } from "@/components/ui/page-layout";

export default async function Blog() {
  // Get blog posts using unified content system
  const posts = await getContentByType('blog');

  return (
    <PageLayout variant="narrow">
      <PageHeader 
        title="Blog" 
        description={`I've written ${posts.length} articles about software development, productivity, and more.`}
      />
      
      <Section>
        <div className="space-y-6">
          <div className="relative w-full">
            <input
              aria-label="Search articles"
              type="text"
              placeholder="Search articles"
              className="block w-full px-4 py-3 text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
            <svg
              className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground"
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
          
          <div className="h-px bg-border w-full" />
          
          <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading articles...</div>}>
            <BlogListClient posts={posts} />
          </Suspense>
        </div>
      </Section>
    </PageLayout>
  );
}
