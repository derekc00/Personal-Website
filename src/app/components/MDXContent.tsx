"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { useMDXComponents } from "../../../mdx-components";

export default function MDXContent({
  source,
}: {
  source: MDXRemoteSerializeResult;
}) {
  const components = useMDXComponents({});

  return (
    <div className="prose dark:prose-invert max-w-none">
      <MDXRemote {...source} components={components} />
    </div>
  );
}
