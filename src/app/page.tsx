"use client";

import { useEffect } from "react";
import Typewriter from "typewriter-effect";
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
                  cursor: "|",
                  cursorClassName: "text-blue-400"
                }}
              />
            </h1>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
