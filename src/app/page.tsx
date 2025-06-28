"use client";

import { useEffect, useState } from "react";
import Typewriter from "typewriter-effect";
import VideoBackgroundClient from "@/components/VideoBackgroundClient";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Homepage mounting - client side");
      }
    } catch (error) {
      console.error("Error in Home component useEffect:", error);
    }
  }, []);

  const handleVideoReady = () => {
    if (process.env.NODE_ENV === "development") {
      console.log("Video ready, starting typewriter animation");
    }
    setVideoReady(true);
  };

  return (
    <ErrorBoundary>
      <div className="relative h-screen w-full">
        <ErrorBoundary>
          <VideoBackgroundClient 
            fileName="derek-in-the-park-FVGcatY5vGoJYmtDg1HDIA207UwXMj.mp4" 
            onVideoReady={handleVideoReady}
          />
        </ErrorBoundary>

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 z-[5]">
          <div className="absolute bottom-8 left-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
              {videoReady && (
                <Typewriter
                  onInit={(typewriter) => {
                    typewriter
                      .typeString('Welcome')
                      .pauseFor(200)
                      .typeString(' to')
                      .pauseFor(200)
                      .typeString(' Derek\'s')
                      .pauseFor(200)
                      .typeString(' website')
                      .start();
                  }}
                  options={{
                    delay: 75,
                    cursor: "│",
                    cursorClassName: "text-white opacity-75"
                  }}
                />
              )}
            </h1>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
