'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-10 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-sm shadow-md dark:bg-black/95 dark:backdrop-blur-sm' 
          : 'bg-transparent dark:bg-black/20 dark:backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-medium text-black dark:text-white">
            Derek
          </Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-black dark:text-white p-2"
              aria-label="Toggle menu"
            >
              {!mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/about"
              className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              About
            </Link>
            <Link 
              href="/projects"
              className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Projects
            </Link>
            <Link 
              href="/blog"
              className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Blog
            </Link>
            <Link 
              href="/three"
              className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              three.js
            </Link>
            <ThemeSwitcher />
          </nav>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href="/about"
              className="block px-3 py-2 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/projects"
              className="block px-3 py-2 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Projects
            </Link>
            <Link 
              href="/blog"
              className="block px-3 py-2 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              href="/three"
              className="block px-3 py-2 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              three.js
            </Link>
            
            <div className="px-3 py-2">
              <div className="flex justify-start">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}