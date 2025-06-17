"use client";

import { Suspense, useState, lazy, useEffect } from "react";
import ThreeDToggle from "@/components/ThreeDToggle";
import VideoBackgroundClient from "@/components/VideoBackgroundClient";
import ErrorBoundary from "@/components/ErrorBoundary";
import ThreeErrorBoundary from "@/components/ThreeErrorBoundary";

const ThreeWorkspace = lazy(() => import("@/app/three/page"));

export default function Home() {
  const [is3D, setIs3D] = useState(false);
  const [hasInitialized3D, setHasInitialized3D] = useState(false);

  useEffect(() => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Homepage mounting - client side');
      }
      
      // Check browser capabilities safely
      const hasWebGL = (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
          return false;
        }
      })();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Browser capabilities:', {
          hasWebGL,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          screen: typeof screen !== 'undefined' ? {
            width: screen.width,
            height: screen.height,
            pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
          } : {}
        });
      }
      
      if (!hasWebGL) {
        console.warn('WebGL not available - 3D features may not work properly');
      }
    } catch (error) {
      console.error('Error in Home component useEffect:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className="relative">
        <ThreeDToggle 
          onToggle={(newIs3D) => {
            setIs3D(newIs3D);
            if (newIs3D) {
              setHasInitialized3D(true);
            }
          }} 
          is3D={is3D} 
        />
        
        {is3D ? (
          <div className="h-screen w-full">
            <ThreeErrorBoundary>
              <Suspense fallback={
                <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-900 to-purple-900">
                  <div className="text-white text-center">
                    <div className="animate-spin text-4xl mb-4">🌐</div>
                    <p>Loading 3D Environment...</p>
                    <p className="text-sm opacity-75 mt-2">
                      {hasInitialized3D ? 'Restoring WebGL context...' : 'Initializing WebGL renderer...'}
                    </p>
                  </div>
                </div>
              }>
                <ThreeWorkspace />
              </Suspense>
            </ThreeErrorBoundary>
          </div>
        ) : (
          <div className="h-screen w-full">
            <ErrorBoundary>
              <VideoBackgroundClient fileName="derek-in-the-park-FVGcatY5vGoJYmtDg1HDIA207UwXMj.mp4" />
            </ErrorBoundary>
          </div>
        )}
        
        {!is3D && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 flex items-center justify-center z-10">
            <div className="text-center text-white max-w-4xl px-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
                Derek
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl mb-8 font-medium">
                Software Developer & Creative
              </p>
              <p className="text-base md:text-lg lg:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
                Building innovative digital experiences through code and design
              </p>
              <p className="text-sm md:text-base opacity-75 mt-6">
                Toggle to 3D view to explore my interactive workspace
              </p>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

