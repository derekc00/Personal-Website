import * as React from "react";
import type { MDXComponents } from "mdx/types";

// import { Callout } from "~/components/mdx/callout";
// import { Codeblock } from "~/components/mdx/code-block";

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Apply Tailwind Typography's prose classes to all MDX content
    wrapper: ({ children }) => (
      <div
        className="prose prose-lg dark:prose-invert 
        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
        prose-h1:text-4xl prose-h2:text-xl prose-h3:text-xl prose-h4:text-lg
        prose-a:text-blue-600 hover:prose-a:text-blue-500 dark:prose-a:text-blue-400
        prose-p:text-gray-800 dark:prose-p:text-gray-200
        prose-strong:font-medium
        prose-ul:list-disc prose-ul:pl-6
        prose-ol:list-decimal prose-ol:pl-6
        max-w-none"
      >
        {children}
      </div>
    ),
    ...components,
  };
}
