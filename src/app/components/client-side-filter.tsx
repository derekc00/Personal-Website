"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function ClientSideFilter({
  allTags,
  selectedTag,
}: {
  allTags: string[];
  selectedTag: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get active tags from URL
  const activeTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];

  const handleTagClick = (tag: string) => {
    let newTags: string[];

    if (activeTags.includes(tag)) {
      // Remove tag if it's already active
      newTags = activeTags.filter((t) => t !== tag);
    } else {
      // Add tag to active tags
      newTags = [...activeTags, tag];
    }

    if (newTags.length === 0) {
      router.push(pathname);
    } else {
      router.push(`${pathname}?tags=${newTags.join(",")}`);
    }
  };

  const clearFilter = () => {
    router.push(pathname);
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
          Filter by:
        </span>
        <div className="inline-flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                activeTags.includes(tag)
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {activeTags.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Active filters:
          </span>
          <div className="flex flex-wrap gap-2 items-center">
            {activeTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 text-xs font-medium bg-black text-white dark:bg-white dark:text-black rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleTagClick(tag)}
                  className="ml-1 hover:opacity-75"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={clearFilter}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
