import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Post, PostMetadata } from "../utils/types";

// Mark as server-only to prevent bundling in client code
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const postsDirectory = path.join(process.cwd(), "content/blog");

/**
 * Gets all blog posts sorted by date
 */
export function getAllPosts(): Post[] {
  // Ensure the directory exists
  if (!fs.existsSync(postsDirectory)) {
    console.warn("Content directory does not exist:", postsDirectory);
    return [];
  }

  try {
    const fileNames = fs.readdirSync(postsDirectory);

    // Filter for MDX files
    const mdxFiles = fileNames.filter((fileName) => fileName.endsWith(".mdx"));

    return mdxFiles.map((fileName) => {
      const slug = fileName.replace(".mdx", "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content: parsedContent } = matter(fileContents);

      // Ensure all required metadata exists
      const metadata: PostMetadata = {
        title: data.title || "Untitled Post",
        date: data.date || new Date().toISOString().split("T")[0],
        tags: Array.isArray(data.tags) ? data.tags : [],
        image: data.image || undefined,
      };

      return {
        slug,
        metadata,
        content: parsedContent,
      };
    });
  } catch (error) {
    console.error("Error getting posts:", error);
    return [];
  }
}

/**
 * Gets a single blog post by slug
 */
export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Ensure all required metadata exists
    const metadata: PostMetadata = {
      title: data.title || "Untitled Post",
      date: data.date || new Date().toISOString().split("T")[0],
      tags: Array.isArray(data.tags) ? data.tags : [],
      image: data.image || undefined,
    };

    return { slug, metadata, content };
  } catch (error) {
    console.error(`Error getting post with slug "${slug}":`, error);
    return null;
  }
}
