"use client";

import { Button } from '@/components/ui/button';
import { Box, Layout } from 'lucide-react';

interface ThreeDToggleProps {
  onToggle: (is3D: boolean) => void;
  is3D: boolean;
}

export default function ThreeDToggle({ onToggle, is3D }: ThreeDToggleProps) {
  return (
    <Button
      onClick={() => onToggle(!is3D)}
      variant="outline"
      size="sm"
      className="fixed top-20 right-4 z-50 bg-background/90 backdrop-blur-sm"
    >
      {is3D ? (
        <>
          <Layout className="w-4 h-4 mr-2" />
          2D View
        </>
      ) : (
        <>
          <Box className="w-4 h-4 mr-2" />
          3D View
        </>
      )}
    </Button>
  );
}