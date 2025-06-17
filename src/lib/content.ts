import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface ContentItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  type: "blog" | "project";
  slug: string;
}

const contentDirectory = path.join(process.cwd(), "content");

export async function getAllContent(): Promise<ContentItem[]> {
  // Get blog posts
  const blogPosts = await getBlogPosts();

  // Get projects (you'll need to implement this based on your project structure)
  const projects = await getProjects();

  // Combine and sort by date
  return [...blogPosts, ...projects].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

async function getBlogPosts(): Promise<ContentItem[]> {
  const blogDir = path.join(contentDirectory, "blog");

  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs.readdirSync(blogDir);

  const posts = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const source = fs.readFileSync(path.join(blogDir, file), "utf8");
      const { data } = matter(source);
      const slug = file.replace(/\.mdx$/, "");

      return {
        id: slug,
        title: data.title || "Untitled",
        excerpt: data.description || data.excerpt || "No description available",
        date: data.date || new Date().toISOString(),
        category: data.category || "Blog",
        image: data.image || "/placeholder.jpg",
        type: "blog" as const,
        slug,
      };
    });

  return posts;
}

async function getProjects(): Promise<ContentItem[]> {
  // This is a placeholder - implement based on your project structure
  // You might want to store project data in a similar MDX format
  // or in a separate data file
  return [];
}

export async function getCategories(): Promise<string[]> {
  const content = await getAllContent();
  return Array.from(new Set(content.map((item) => item.category)));
}

export async function searchContent(query: string): Promise<ContentItem[]> {
  const content = await getAllContent();
  const searchTerm = query.toLowerCase();

  return content.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.excerpt.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
  );
}
