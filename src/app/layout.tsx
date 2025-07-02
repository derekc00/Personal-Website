import "./globals.css";
import type { Metadata } from "next";
import ThemeProvider from "@/providers/ThemeProvider";
import { UI_CONSTANTS } from '@/lib/constants';

export const metadata: Metadata = {
  title: "Derek's Website",
  description: "Personal website and portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This script prevents the flash of unstyled content (FOUC)
  // It's written as a string to prevent Next.js from adding any script tags
  const setInitialTheme = `
    (function() {
      // Check if a theme is stored in localStorage
      const storedTheme = localStorage.getItem('theme');  
      
      if (storedTheme === 'dark') {
        // Apply dark mode directly
        document.documentElement.classList.add('dark');
      } else if (storedTheme === 'light') {
        // Apply light mode directly
        document.documentElement.classList.remove('dark');
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        }
      }
      
      // Add class to prevent transitions on page load
      document.documentElement.classList.add('no-transition');
      
      // Remove the class after a short delay to enable transitions
      window.setTimeout(function() {
        document.documentElement.classList.remove('no-transition');
      }, ${UI_CONSTANTS.TRANSITION_DELAY});
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
