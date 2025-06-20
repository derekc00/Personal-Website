import "./globals.css";
import type { Metadata } from "next";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import ThemeProvider from "@/providers/ThemeProvider";

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
      }, 100);
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
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
