import * as React from "react";
import type { MDXComponents } from "mdx/types";
import { Highlight, themes } from "prism-react-renderer";
import { useTheme } from "next-themes";

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  const { theme } = useTheme();

  const CodeBlock: React.FunctionComponent<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
  > = (props) => {
    const { className, children } = props;
    if (className) {
      const language = className.replace("language-", "");
      return (
        <div className="relative my-3">
          <Highlight
            theme={theme === "dark" ? themes.nightOwl : themes.github}
            code={String(children).trim()}
            language={language}
          >
            {({ style, tokens, getLineProps, getTokenProps }) => (
              <pre className="relative border border-gray-200 dark:border-gray-700">
                {language && (
                  <span className="absolute right-3 top-2 text-xs text-gray-400 dark:text-gray-500 font-mono opacity-60">
                    {language}
                  </span>
                )}
                {tokens.map((line, i) => (
                  <div
                    key={i}
                    {...getLineProps({ line })}
                    className="table-row"
                  >
                    <span className="table-cell text-right pr-4 select-none text-gray-400 dark:text-gray-500 w-12">
                      {i + 1}
                    </span>
                    <span className="table-cell">
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      );
    }
    return <code>{children}</code>;
  };

  return {
    // Code component for syntax highlighting
    code: CodeBlock as any,

    // Let Tailwind's typography plugin handle most of the styling
    // Only override specific components that need custom styling
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-blue-300 dark:border-gray-600 pl-4 italic my-4">
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
