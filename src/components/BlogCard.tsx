import Link from "next/link";
import Image from "next/image";
import { ContentItem } from "@/lib/content";

interface BlogCardProps {
  post: ContentItem;
}

export default function BlogCard({ post }: BlogCardProps) {
  const href =
    post.type === "blog" ? `/blog/${post.slug}` : `/projects/${post.slug}`;

  return (
    <Link
      href={href}
      className="group block overflow-hidden transition-all duration-300 h-full"
    >
      <div className="h-full flex flex-col border border-gray-100 rounded-2xl overflow-hidden hover:shadow-sm transition-all duration-300">
        <div className="relative aspect-[3/2] overflow-hidden">
          <Image
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="flex-grow flex flex-col p-6">
          <div className="flex items-center mb-3">
            <span className="text-xs text-gray-500">{post.date}</span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-xs font-medium text-gray-900">
              {post.category}
            </span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-xs font-medium text-gray-900 capitalize">
              {post.type}
            </span>
          </div>

          <h2 className="text-xl font-medium mb-3 group-hover:text-gray-700 transition-colors duration-200">
            {post.title}
          </h2>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {post.excerpt}
          </p>

          <div className="mt-auto">
            <span className="text-sm font-medium text-gray-900 group-hover:underline">
              Read more
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
