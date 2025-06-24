// Legacy types for backward compatibility
// These types are maintained for existing consumers
// New code should use schema-derived types from @/lib/schemas

interface PostMetadata {
  title: string;
  date: string;
  tags: string[];
  image?: string;
}

interface Post {
  slug: string;
  content: string;
  metadata: PostMetadata;
}

export type { Post, PostMetadata };
