"use client";

import { useEffect } from "react";
import VideoBackgroundClient from "@/components/VideoBackgroundClient";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
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
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
              Welcome to Derek&apos;s website
              <span className="animate-pulse ml-1 text-blue-400">|</span>
            </h1>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
