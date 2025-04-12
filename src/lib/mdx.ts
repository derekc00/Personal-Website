import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

interface FrontMatter {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  image?: string;
  [key: string]: any;
}

// This reads the MDX file content and returns the frontmatter and content
export async function getMdxBySlug(slug: string, directory: string = "blog") {
  try {
    const filePath = path.join(
      process.cwd(),
      "content",
      directory,
      `${slug}.mdx`
    );

    const fileContent = await fs.readFile(filePath, "utf8");
    // Use gray-matter to parse the frontmatter
    const { data, content } = matter(fileContent);

    return {
      frontmatter: data as FrontMatter,
      content,
    };
  } catch (error) {
    console.error("Error getting MDX file", slug, error);
    return null;
  }
}

// Get all MDX files from a directory
export async function getAllMdxFiles(directory: string = "blog") {
  try {
    const contentDir = path.join(process.cwd(), "content", directory);
    const files = await fs.readdir(contentDir);
    const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

    const allMdx = await Promise.all(
      mdxFiles.map(async (file) => {
        const slug = file.replace(/\.mdx$/, "");
        const result = await getMdxBySlug(slug, directory);

        if (!result) return null;

        return {
          slug,
          ...result.frontmatter,
        };
      })
    );

    // Filter out any null values and sort by date
    return allMdx
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime()
      );
  } catch (error) {
    console.error(`Error getting all MDX files: ${error}`);
    return [];
  }
}
