"use client";

import { MDXRemote } from "next-mdx-remote";
import { useMDXComponents } from "../../../mdx-components";
import type { MDXComponents } from "mdx/types";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";

interface MDXContentProps {
  source: MDXRemoteSerializeResult;
}

export default function MDXContent({ source }: MDXContentProps) {
  const components = useMDXComponents({} as MDXComponents);

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-code:text-primary prose-pre:bg-muted">
      <MDXRemote {...source} components={components} />
    </div>
  );
}
