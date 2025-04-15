import * as React from "react";
import type { MDXComponents } from "mdx/types";
import { highlight } from "sugar-high";

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Code component for syntax highlighting
    code: (props: any) => {
      const { className, children } = props;
      const language = className?.replace("language-", "");

      if (className) {
        // Code block with language
        const highlightedCode = highlight(String(children), language);
        return (
          <div className="relative my-6">
            {language && (
              <div className="absolute right-2 top-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                {language}
              </div>
            )}
            <pre className="p-4 rounded-lg overflow-x-auto bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
              <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            </pre>
          </div>
        );
      }

      // Inline code
      return (
        <code className="font-mono text-sm px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
          {children}
        </code>
      );
    },

    // Let Tailwind's typography plugin handle most of the styling
    // Only override specific components that need custom styling
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4">
        {props.children}
      </blockquote>
    ),
    a: (props: any) => (
      <a
        href={props.href}
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        {props.children}
      </a>
    ),
    img: (props: any) => (
      <img
        src={props.src}
        alt={props.alt}
        className="rounded-lg my-6 max-w-full"
      />
    ),
    ...components,
  };
}
