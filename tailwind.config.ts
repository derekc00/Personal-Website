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
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
