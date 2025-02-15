import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Post, PostMetadata } from "../utils/types";

const postsDirectory = path.join(process.cwd(), "content");

export function getAllPosts(): Post[] {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName) => {
    const slug = fileName.replace(".md", "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    const metadata = data as PostMetadata;

    return { slug, metadata, content: fileContents };
  });
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const metadata = data as PostMetadata;

  return { slug, metadata, content };
}
