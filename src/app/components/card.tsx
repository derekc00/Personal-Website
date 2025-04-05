"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CardProps {
  title: string;
  date: string;
  image?: string;
  tags: string[];
  slug: string;
  onTagClick?: (tag: string) => void;
}

const Card = ({ slug, title, date, image, tags, onTagClick }: CardProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const fallbackImage = "/home.jpg"; // Default image if none provided

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 animate-pulse">
            <svg
              className="w-10 h-10 text-gray-300 dark:text-gray-700"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75z" />
            </svg>
          </div>
        )}
        <Link href={`/blog/${slug}`}>
          <Image
            className={`object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            src={image || fallbackImage}
            alt={title}
            width={800}
            height={600}
            onLoad={handleImageLoad}
            priority={false}
          />
        </Link>
      </div>

      <div className="flex flex-col grow p-5">
        <div className="flex items-center mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {formattedDate}
          </span>
        </div>

        <Link href={`/blog/${slug}`} className="mb-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:underline">
            {title}
          </h2>
        </Link>

        <div className="mt-auto pt-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <button
                key={index}
                onClick={() => onTagClick && onTagClick(tag)}
                className="inline-block px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
