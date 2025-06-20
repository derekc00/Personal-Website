"use client";

import { Suspense, useEffect } from "react";
import { useSpring, animated, to } from "@react-spring/web";
import VideoBackgroundClient from "@/components/VideoBackgroundClient";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  // Continuous bouncing ball physics animation
  const bouncingAnimation = useSpring({
    from: {
      x: 90, // Start at 90vw
      y: -60, // Start at -60vh
      opacity: 0,
    },
    to: [
      { x: 90, y: -60, opacity: 1 }, // Fade in at start position
      { x: 75, y: -45 }, // Arc down and right
      { x: 60, y: -25 }, // Continue arc
      { x: 45, y: 0 }, // First ground contact
      { x: 35, y: -30 }, // Second bounce peak
      { x: 25, y: -15 }, // Arc down
      { x: 15, y: 0 }, // Second ground contact
      { x: 10, y: -15 }, // Third bounce peak
      { x: 5, y: -8 }, // Arc down
      { x: 2, y: 0 }, // Third ground contact
      { x: 1, y: -5 }, // Fourth bounce peak
      { x: 0.5, y: -2 }, // Tiny arc
      { x: 0, y: 0 }, // Final landing
    ],
    config: {
      duration: 3500,
      easing: (t) =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1, // Custom easing for natural bounce
    },
    delay: 300,
  });

  useEffect(() => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Homepage mounting - client side");
      }
    } catch (error) {
      console.error("Error in Home component useEffect:", error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className="relative h-screen w-full">
        <ErrorBoundary>
          <VideoBackgroundClient fileName="derek-in-the-park-FVGcatY5vGoJYmtDg1HDIA207UwXMj.mp4" />
        </ErrorBoundary>

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 z-[5]">
          <div className="absolute bottom-8 left-8">
            <animated.h1
              className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight"
              style={{
                transform: to(
                  [bouncingAnimation.x, bouncingAnimation.y],
                  (x, y) => `translate3d(${x}vw, ${y}vh, 0)`
                ),
                opacity: bouncingAnimation.opacity,
              }}
            >
              Derek
            </animated.h1>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
