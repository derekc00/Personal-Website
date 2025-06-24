"use client";

import { Suspense, useEffect } from "react";
import VideoBackground from "./VideoBackground";

interface VideoBackgroundClientProps {
  fileName: string;
  onVideoReady?: () => void;
}

function VideoFallback() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p>Loading video...</p>
      </div>
    </div>
  );
}

export default function VideoBackgroundClient({ fileName, onVideoReady }: VideoBackgroundClientProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('VideoBackgroundClient mounting');
    }
  }, []);

  return (
    <Suspense fallback={<VideoFallback />}>
      <VideoBackground fileName={fileName} onVideoReady={onVideoReady} />
    </Suspense>
  );
}