import { compileMDX } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

// Components to use in MDX content
const components: MDXComponents = {
  // Add your custom components here
};

export async function processMDX(content: string) {
  const { content: processedContent, frontmatter } = await compileMDX({
    source: content,
    components,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight, rehypeSlug],
      },
    },
  });

  return { content: processedContent, frontmatter };
}
