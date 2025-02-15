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
