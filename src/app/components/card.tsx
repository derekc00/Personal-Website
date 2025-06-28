"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";

export interface BlogCardProps {
  title: string;
  date: string;
  image?: string;
  tags: string[];
  slug: string;
  onTagClick?: (tag: string) => void;
}

const BlogCard = ({
  slug,
  title,
  date,
  image,
  tags,
  onTagClick,
}: BlogCardProps) => {
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
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
            <svg
              className="w-10 h-10 text-muted-foreground"
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

      <CardHeader className="pb-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarIcon className="mr-1 h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
      </CardHeader>

      <CardContent>
        <Link href={`/blog/${slug}`}>
          <h2 className="text-xl font-bold line-clamp-2 group-hover:underline">
            {title}
          </h2>
        </Link>
      </CardContent>

      <CardFooter>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => onTagClick && onTagClick(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
