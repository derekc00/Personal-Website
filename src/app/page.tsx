import { Suspense } from "react";
import { list } from "@vercel/blob";

export default function Home() {
  return (
    <div className="relative">
      <div className="h-screen w-full">
        <Suspense fallback={<div>Loading...</div>}>
          <VideoComponent fileName="derek-in-the-park-FVGcatY5vGoJYmtDg1HDIA207UwXMj.mp4" />
        </Suspense>
      </div>
      {/* Your other content */}
    </div>
  );
}

async function VideoComponent({ fileName }: { fileName: string }) {
  const { blobs } = await list({
    prefix: fileName,
    limit: 1,
  });
  const { url } = blobs[0];

  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      aria-label="Background video"
      className="w-full h-full object-cover absolute top-0 left-0"
    >
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
