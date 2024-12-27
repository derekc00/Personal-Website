import Link from "next/link";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Derek's Website",
  description: "Personal website and portfolio",
};

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 transition-colors duration-300 hover:bg-white">
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-4 h-16">
        <Link
          href="/"
          className="text-xl font-bold text-white hover:text-gray-800 transition-colors duration-300 header-link"
        >
          Derek
        </Link>
        <div className="flex gap-8">
          <Link
            href="/about"
            className="text-white hover:text-gray-800 transition-colors duration-300 header-link"
          >
            About
          </Link>
          <Link
            href="/projects"
            className="text-white hover:text-gray-800 transition-colors duration-300 header-link"
          >
            Projects
          </Link>
          <Link
            href="/blog"
            className="text-white hover:text-gray-800 transition-colors duration-300 header-link"
          >
            Blog
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
