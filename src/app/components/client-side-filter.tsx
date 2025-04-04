// src/app/components/client-side-filter.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";

export default function ClientSideFilter({
  allTags,
  selectedTag,
}: {
  allTags: string[];
  selectedTag: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      // Clear the tag filter
      router.push(pathname);
    } else {
      // Set the tag filter
      router.push(`${pathname}?tag=${tag}`);
    }
  };

  const clearFilter = () => {
    router.push(pathname);
  };

  return (
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
              selectedTag === tag
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tag}
          </button>
        ))}
        {selectedTag && (
          <button
            onClick={clearFilter}
            className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
