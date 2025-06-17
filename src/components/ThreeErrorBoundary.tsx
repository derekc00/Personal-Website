"use client";

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ThreeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Rendering Error:', error);
    console.error('Error Info:', errorInfo);
    
    // Check for specific WebGL or Three.js errors
    if (error.message.includes('WebGL')) {
      console.error('WebGL is not supported or failed to initialize');
    }
    
    if (error.message.includes('THREE')) {
      console.error('Three.js rendering error occurred');
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full h-full bg-gradient-to-br from-red-900 to-purple-900 flex items-center justify-center">
          <div className="text-white text-center max-w-md px-4">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold mb-2">3D Rendering Error</h2>
            <p className="mb-4 text-sm opacity-90">
              Your browser may not support WebGL or 3D graphics rendering.
            </p>
            <Button 
              onClick={() => this.setState({ hasError: false })}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Try Again
            </Button>
            <div className="mt-4 text-xs opacity-75">
              <p>Try updating your browser or enabling hardware acceleration</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ThreeErrorBoundary;