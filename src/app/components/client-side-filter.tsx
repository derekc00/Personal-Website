"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

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

  // Get active tags from URL and convert to lowercase
  const activeTags =
    searchParams
      .get("tags")
      ?.split(",")
      .filter(Boolean)
      .map((tag) => tag.toLowerCase()) || [];

  // Sort tags alphabetically (case-insensitive) and ensure they're lowercase
  const sortedTags = [...allTags]
    .map((tag) => tag.toLowerCase())
    .sort((a, b) => a.localeCompare(b));

  const handleTagClick = (tag: string) => {
    const lowercaseTag = tag.toLowerCase();
    let newTags: string[];

    if (activeTags.includes(lowercaseTag)) {
      // Remove tag if it's already active
      newTags = activeTags.filter((t) => t !== lowercaseTag);
    } else {
      // Add tag to active tags
      newTags = [...activeTags, lowercaseTag];
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
        <div className="inline-flex flex-wrap gap-2">
          {sortedTags.map((tag) => (
            <Button
              key={tag}
              onClick={() => handleTagClick(tag)}
              variant={activeTags.includes(tag) ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {activeTags.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2 items-center">
            {activeTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleTagClick(tag)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {tag} filter</span>
                </Button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
