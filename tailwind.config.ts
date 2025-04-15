import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/providers/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./mdx-components.tsx",
  ],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      // Add transition for smooth theme changes
      transitionProperty: {
        colors: "background-color, border-color, color, fill, stroke",
      },
      keyframes: {
        tagAppear: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        tagAppear: "tagAppear 0.2s ease-out forwards",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "var(--tw-prose-body)",
            a: {
              color: "var(--tw-prose-links)",
              "&:hover": {
                color: "var(--tw-prose-links-hover)",
              },
            },
            pre: {
              backgroundColor: "transparent",
              padding: "1rem",
              borderRadius: "0.5rem",
              overflowX: "auto",
            },
            code: {
              backgroundColor: "var(--tw-prose-code-bg)",
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
              fontWeight: "400",
            },
            // Add other typography elements as needed
          },
        },
        dark: {
          css: {
            color: "var(--tw-prose-invert-body)",
            h1: { color: "var(--tw-prose-invert-headings)" },
            h2: { color: "var(--tw-prose-invert-headings)" },
            h3: { color: "var(--tw-prose-invert-headings)" },
            h4: { color: "var(--tw-prose-invert-headings)" },
            h5: { color: "var(--tw-prose-invert-headings)" },
            h6: { color: "var(--tw-prose-invert-headings)" },
            p: { color: "var(--tw-prose-invert-body)" },
            li: { color: "var(--tw-prose-invert-body)" },
            strong: { color: "var(--tw-prose-invert-headings)" },
            code: { color: "var(--tw-prose-invert-body)" },
            a: {
              color: "var(--tw-prose-invert-links)",
              "&:hover": {
                color: "var(--tw-prose-invert-links-hover)",
              },
            },
            pre: {
              backgroundColor: "transparent",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
