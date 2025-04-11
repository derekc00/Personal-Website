import * as React from "react";
import type { MDXComponents } from "mdx/types";

// todo: might need to add these back in
// import { Callout } from "~/components/mdx/callout";
// import { Codeblock } from "~/components/mdx/code-block";

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => (
      <div className="prose dark:prose-dark max-w-none">{children}</div>
    ),
    ...components,
  };
}
