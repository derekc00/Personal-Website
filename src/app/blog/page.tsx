'use client';

import { useEffect, useState } from "react";
import Card from "@/app/components/card";
import Container from "@/app/components/container";
import { Post } from "@/utils/types";
import { useSearchParams } from "next/navigation";

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Get the tag from URL if present
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    }
    
    // Fetch posts from API
    async function fetchPosts() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        
        // Sort posts by date
        const sortedPosts = data.sort(
          (a: Post, b: Post) =>
            new Date(b.metadata.date).getTime() -
            new Date(a.metadata.date).getTime()
        );
        
        // Extract all unique tags
        const tags = Array.from(
          new Set(
            sortedPosts.flatMap((post: Post) => post.metadata.tags)
          )
        );
        
        setPosts(sortedPosts);
        setAllTags(tags);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPosts();
  }, [searchParams]);
  
  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };
  
  const filteredPosts = selectedTag 
    ? posts.filter(post => post.metadata.tags.includes(selectedTag))
    : posts;
    
  return (
    <Container>
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Blog
            </h1>
            
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                Filter by:
              </span>
              <div className="inline-flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      selectedTag === tag
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="h-px bg-gray-200 dark:bg-gray-800 w-full my-8" />
          
          {error ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {error}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-lg overflow-hidden shadow-sm animate-pulse bg-gray-100 dark:bg-gray-800 h-80"></div>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(({ slug, metadata }) => (
                <Card
                  key={slug}
                  slug={slug}
                  title={metadata.title}
                  date={metadata.date}
                  image={metadata.image}
                  tags={metadata.tags}
                  onTagClick={handleTagClick}
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
                  : 'No blog posts available at the moment.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </Container>
  );
}
