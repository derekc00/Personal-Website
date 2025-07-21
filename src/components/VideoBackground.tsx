"use client";

import { useState, useEffect } from "react";
import { ERROR_MESSAGES, API_ENDPOINTS } from '@/lib/constants';

type VideoBackgroundProps = {
  fileName: string;
  onVideoReady?: () => void;
}

function VideoFallback({
  message,
  showConfig = false,
}: {
  message: string;
  showConfig?: boolean;
}) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-white text-center max-w-md px-4">
        <div className="text-6xl mb-4">🎬</div>
        <p className="mb-2">{message}</p>
        {showConfig && (
          <div className="text-sm opacity-75 mt-4">
            <p>To fix this:</p>
            <p>1. Set your BLOB_READ_WRITE_TOKEN in .env.development.local</p>
            <p>2. Upload your video to Vercel Blob storage</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoBackground({ fileName, onVideoReady }: VideoBackgroundProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVideo() {
      try {
        if (process.env.NODE_ENV?.toLowerCase() === "development") {
          console.log(`Loading video via API: ${fileName}`);
        }

        const response = await fetch(
          `${API_ENDPOINTS.VIDEO}?fileName=${encodeURIComponent(fileName)}`
        );
        const data = await response.json();

        if (!response.ok) {
          console.warn(`API error: ${data.error}`);
          setError(data.error || ERROR_MESSAGES.VIDEO_NOT_FOUND);
          setLoading(false);
          return;
        }

        if (process.env.NODE_ENV?.toLowerCase() === "development") {
          console.log(`Video loaded successfully via API: ${data.url}`);
        }
        setVideoUrl(data.url);
        setLoading(false);
      } catch (error) {
        console.error("Error loading video via API:", error);

        // More specific error handling
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const isNetworkError =
          errorMessage.includes("network") || errorMessage.includes("fetch");

        let userMessage = "Unable to load video";
        if (isNetworkError) {
          userMessage = "Network error loading video";
        }

        setError(userMessage);
        setLoading(false);
      }
    }

    loadVideo();
  }, [fileName]);

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <VideoFallback
        message={error || ERROR_MESSAGES.VIDEO_NOT_FOUND}
        showConfig={error?.includes("auth")}
      />
    );
  }

  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      aria-label="Background video"
      className="w-full h-full object-cover absolute top-0 left-0 z-0"
      onError={(e) => {
        console.error("Video playback error:", e);
      }}
      onLoadStart={() => {
        if (process.env.NODE_ENV?.toLowerCase() === "development") {
          console.log("Video loading started");
        }
      }}
      onCanPlay={() => {
        if (process.env.NODE_ENV?.toLowerCase() === "development") {
          console.log("Video can start playing");
        }
        onVideoReady?.();
      }}
    >
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
