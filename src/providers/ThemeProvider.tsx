'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  // Add this to prevent the flash of incorrect theme on page load
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    // This prevents the flash in SSR before client hydration
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }
  
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={false}
      themes={['light', 'dark', 'system']}
    >
      {children}
    </NextThemeProvider>
  );
}