import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { FrontmatterSchema, ContentItemSchema, type ContentItem } from "./schemas";
import { FILE_EXTENSIONS, ERROR_MESSAGES, CONTENT_TYPES } from './constants';

const contentDirectory = path.join(process.cwd(), "content");

export async function getAllContent(): Promise<ContentItem[]> {
  const blogDir = path.join(contentDirectory, "blog");
  
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs.readdirSync(blogDir);
  const validContent: ContentItem[] = [];

  for (const file of files) {
    if (!file.endsWith(FILE_EXTENSIONS.MDX)) continue;

    try {
      const slug = file.replace(new RegExp(`\\${FILE_EXTENSIONS.MDX}$`), "");
      const source = fs.readFileSync(path.join(blogDir, file), "utf8");
      const { data, content } = matter(source);

      // Validate frontmatter with schema
      const frontmatter = FrontmatterSchema.parse(data);
      
      const contentItem: ContentItem = {
        id: slug,
        slug,
        title: frontmatter.title,
        excerpt: frontmatter.description || frontmatter.excerpt || ERROR_MESSAGES.NO_DESCRIPTION,
        date: frontmatter.date,
        category: frontmatter.category,
        image: frontmatter.image || null,
        type: frontmatter.type,
        tags: frontmatter.tags,
        content,
      };

      // Validate the complete content item
      const validatedItem = ContentItemSchema.parse(contentItem);
      validContent.push(validatedItem);
    } catch (error) {
      console.warn(`Invalid content in ${file}:`, error);
      // Skip invalid content
    }
  }

  // Sort by date descending
  return validContent.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getContentBySlug(slug: string): Promise<ContentItem | null> {
  const filePath = path.join(contentDirectory, "blog", `${slug}${FILE_EXTENSIONS.MDX}`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const source = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(source);

    // Validate frontmatter with schema
    const frontmatter = FrontmatterSchema.parse(data);
    
    const contentItem: ContentItem = {
      id: slug,
      slug,
      title: frontmatter.title,
      excerpt: frontmatter.description || frontmatter.excerpt || "No description available",
      date: frontmatter.date,
      category: frontmatter.category,
      image: frontmatter.image || null,
      type: frontmatter.type,
      tags: frontmatter.tags,
      content,
    };

    // Validate the complete content item
    return ContentItemSchema.parse(contentItem);
  } catch (error) {
    console.warn(`Invalid content for slug ${slug}:`, error);
    return null;
  }
}

export async function getContentByType(type: typeof CONTENT_TYPES.BLOG | typeof CONTENT_TYPES.PROJECT): Promise<ContentItem[]> {
  const allContent = await getAllContent();
  return allContent.filter(item => item.type === type);
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

// Re-export types for backward compatibility
export type { ContentItem } from "./schemas";
