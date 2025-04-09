import { compileMDX } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import fs from "fs/promises";
import path from "path";

// Define your custom components
const mdxComponents: MDXComponents = {
  // Custom components will be merged with those from mdx-components.tsx
};

interface FrontMatter {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  image?: string;
  [key: string]: any;
}

export async function processMDX(content: string) {
  try {
    const { content: processedContent, frontmatter } =
      await compileMDX<FrontMatter>({
        source: content,
        components: mdxComponents,
        options: {
          parseFrontmatter: true,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeHighlight, rehypeSlug],
          },
        },
      });

    return { content: processedContent, frontmatter };
  } catch (error) {
    console.error(`Error processing MDX: ${error}`);
    throw error;
  }
}

// Get a single MDX file from the content directory
export async function getMdxBySlug(slug: string, directory: string = "blog") {
  try {
    const filePath = path.join(
      process.cwd(),
      "content",
      directory,
      `${slug}.mdx`
    );
    const fileContent = await fs.readFile(filePath, "utf8");
    return processMDX(fileContent);
  } catch (error) {
    console.error(`Error getting MDX file ${slug}: ${error}`);
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
