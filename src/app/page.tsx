"use client";

import { Suspense, useState, lazy, useEffect } from "react";
import { useSpring, animated, to } from "@react-spring/web";
import ThreeDToggle from "@/components/ThreeDToggle";
import VideoBackgroundClient from "@/components/VideoBackgroundClient";
import ErrorBoundary from "@/components/ErrorBoundary";
import ThreeErrorBoundary from "@/components/ThreeErrorBoundary";

const ThreeWorkspace = lazy(() => import("@/app/three/page"));

export default function Home() {
  const [is3D, setIs3D] = useState(false);
  const [hasInitialized3D, setHasInitialized3D] = useState(false);

  // Continuous bouncing ball physics animation
  const bouncingAnimation = useSpring({
    from: { 
      x: 90, // Start at 90vw
      y: -60, // Start at -60vh
      opacity: 0
    },
    to: [
      { x: 90, y: -60, opacity: 1 }, // Fade in at start position
      { x: 75, y: -45 }, // Arc down and right
      { x: 60, y: -25 }, // Continue arc
      { x: 45, y: 0 },   // First ground contact
      { x: 35, y: -30 }, // Second bounce peak
      { x: 25, y: -15 }, // Arc down
      { x: 15, y: 0 },   // Second ground contact
      { x: 10, y: -15 }, // Third bounce peak
      { x: 5, y: -8 },   // Arc down
      { x: 2, y: 0 },    // Third ground contact
      { x: 1, y: -5 },   // Fourth bounce peak
      { x: 0.5, y: -2 }, // Tiny arc
      { x: 0, y: 0 }     // Final landing
    ],
    config: {
      duration: 3500,
      easing: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 // Custom easing for natural bounce
    },
    delay: 300,
  });

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
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 z-10">
            <div className="absolute bottom-8 left-8">
              <animated.h1 
                className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight"
                style={{
                  transform: to([bouncingAnimation.x, bouncingAnimation.y], (x, y) => 
                    `translate3d(${x}vw, ${y}vh, 0)`
                  ),
                  opacity: bouncingAnimation.opacity
                }}
              >
                Derek
              </animated.h1>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

