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
import { ContentItem } from "@/lib/schemas";

interface BlogCardProps {
  post: ContentItem;
  onTagClick?: (tag: string) => void;
}

export default function BlogCard({ post, onTagClick }: BlogCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const fallbackImage = "/home.jpg";

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const href = post.type === "blog" ? `/blog/${post.slug}` : `/projects/${post.slug}`;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
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
        <Link href={href}>
          <Image
            className={`object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            src={post.image || fallbackImage}
            alt={post.title}
            width={800}
            height={600}
            onLoad={handleImageLoad}
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center text-xs text-muted-foreground space-x-2">
          <CalendarIcon className="h-3 w-3" />
          <span>{formattedDate}</span>
          <span>•</span>
          <span className="font-medium">{post.category}</span>
          <span>•</span>
          <span className="font-medium capitalize">{post.type}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <Link href={href}>
          <h2 className="text-xl font-bold line-clamp-2 group-hover:underline mb-3">
            {post.title}
          </h2>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {post.excerpt}
        </p>
      </CardContent>

      <CardFooter>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={onTagClick ? "cursor-pointer hover:bg-secondary/80" : ""}
              onClick={() => onTagClick && onTagClick(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}