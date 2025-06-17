"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ContentFilterProps {
  categories: string[];
  onSearch: (query: string) => void;
  onCategorySelect: (category: string | null) => void;
}

export default function ContentFilter({
  categories,
  onSearch,
  onCategorySelect,
}: ContentFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
    onCategorySelect(category);
  };

  return (
    <section className="py-8 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search content..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className={`rounded-full text-sm h-8 px-4 ${
                selectedCategory === null
                  ? "bg-gray-900 text-white hover:bg-gray-800 border-0"
                  : "text-gray-600 hover:bg-gray-100 border-gray-200"
              }`}
              onClick={() => handleCategoryClick(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                className={`rounded-full text-sm h-8 px-4 ${
                  selectedCategory === category
                    ? "bg-gray-900 text-white hover:bg-gray-800 border-0"
                    : "text-gray-600 hover:bg-gray-100 border-gray-200"
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
