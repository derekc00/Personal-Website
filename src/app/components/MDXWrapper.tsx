"use client";

import dynamic from "next/dynamic";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";

const MDXContent = dynamic(() => import("./MDXContent"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-800 h-32 rounded"></div>
});

type MDXWrapperProps = {
  source: MDXRemoteSerializeResult;
}

export default function MDXWrapper({ source }: MDXWrapperProps) {
  return <MDXContent source={source} />;
}