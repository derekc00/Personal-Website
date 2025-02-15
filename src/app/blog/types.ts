interface PostMetadata {
  title: string;
  date: string;
  tags: string[];
  image?: string;
}

interface Post {
  slug: string;
  metadata: PostMetadata;
}
