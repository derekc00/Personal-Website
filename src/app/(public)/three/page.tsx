"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

function Room() {
  return (
    <group>
      {/* Floor */}
      <Plane 
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -3, 0]}
      >
        <meshStandardMaterial color="#f0f0f0" />
      </Plane>
      
      {/* Back Wall */}
      <Plane 
        args={[20, 10]} 
        position={[0, 2, -10]}
      >
        <meshStandardMaterial color="#e8e8e8" />
      </Plane>
      
      {/* Left Wall */}
      <Plane 
        args={[20, 10]} 
        rotation={[0, Math.PI / 2, 0]} 
        position={[-10, 2, 0]}
      >
        <meshStandardMaterial color="#f5f5f5" />
      </Plane>
      
      {/* Right Wall */}
      <Plane 
        args={[20, 10]} 
        rotation={[0, -Math.PI / 2, 0]} 
        position={[10, 2, 0]}
      >
        <meshStandardMaterial color="#f5f5f5" />
      </Plane>
    </group>
  );
}

function Desk() {
  return (
    <group position={[0, -1.5, -5]}>
      {/* Desk Surface */}
      <Box args={[6, 0.2, 3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Desk Legs */}
      <Box args={[0.2, 2, 0.2]} position={[-2.8, -1, -1.3]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      <Box args={[0.2, 2, 0.2]} position={[2.8, -1, -1.3]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      <Box args={[0.2, 2, 0.2]} position={[-2.8, -1, 1.3]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      <Box args={[0.2, 2, 0.2]} position={[2.8, -1, 1.3]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      
      {/* Monitor */}
      <Box args={[2.5, 1.5, 0.1]} position={[0, 1.2, -1]}>
        <meshStandardMaterial color="#2a2a2a" />
      </Box>
      
      {/* Monitor Screen */}
      <Plane args={[2.2, 1.2]} position={[0, 1.2, -0.95]}>
        <meshStandardMaterial color="#1a1a1a" emissive="#0a0a0a" />
      </Plane>
      
      {/* Monitor Stand */}
      <Box args={[0.3, 0.8, 0.3]} position={[0, 0.4, -1]}>
        <meshStandardMaterial color="#555555" />
      </Box>
    </group>
  );
}

function ProjectDisplays({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter();

  const handleProjectClick = () => {
    router.push('/projects');
  };

  const handleAboutClick = () => {
    router.push('/about');
  };

  const handleBlogClick = () => {
    router.push('/blog');
  };

  return (
    <group>
      {/* Project Card */}
      <group position={[-6, 0, -8]}>
        <Plane 
          args={[3, 2]} 
          position={[0, 0, 0.1]}
          onClick={handleProjectClick}
        >
          <meshStandardMaterial color="#ffffff" />
        </Plane>
        <Text
          position={[0, 0.5, 0.2]}
          fontSize={isMobile ? 0.25 : 0.3}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          My Projects
        </Text>
        <Text
          position={[0, 0, 0.2]}
          fontSize={isMobile ? 0.12 : 0.15}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          Portfolio Gallery
        </Text>
        <Text
          position={[0, -0.5, 0.2]}
          fontSize={isMobile ? 0.08 : 0.1}
          color="#999999"
          anchorX="center"
          anchorY="middle"
        >
          {isMobile ? "Tap to explore" : "Click to explore"}
        </Text>
      </group>
      
      {/* About Me Display */}
      <group position={[6, 0, -8]}>
        <Plane 
          args={[3, 2]} 
          position={[0, 0, 0.1]}
          onClick={handleAboutClick}
        >
          <meshStandardMaterial color="#ffffff" />
        </Plane>
        <Text
          position={[0, 0.5, 0.2]}
          fontSize={isMobile ? 0.25 : 0.3}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          About Me
        </Text>
        <Text
          position={[0, 0, 0.2]}
          fontSize={isMobile ? 0.12 : 0.15}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          Professional Info
        </Text>
        <Text
          position={[0, -0.5, 0.2]}
          fontSize={isMobile ? 0.08 : 0.1}
          color="#999999"
          anchorX="center"
          anchorY="middle"
        >
          {isMobile ? "Tap to learn more" : "Click to learn more"}
        </Text>
      </group>

      {/* Blog Display */}
      <group position={[0, 0, -8]}>
        <Plane 
          args={[3, 2]} 
          position={[0, 0, 0.1]}
          onClick={handleBlogClick}
        >
          <meshStandardMaterial color="#ffffff" />
        </Plane>
        <Text
          position={[0, 0.5, 0.2]}
          fontSize={isMobile ? 0.25 : 0.3}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          Blog
        </Text>
        <Text
          position={[0, 0, 0.2]}
          fontSize={isMobile ? 0.12 : 0.15}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          Thoughts & Ideas
        </Text>
        <Text
          position={[0, -0.5, 0.2]}
          fontSize={isMobile ? 0.08 : 0.1}
          color="#999999"
          anchorX="center"
          anchorY="middle"
        >
          {isMobile ? "Tap to read" : "Click to read"}
        </Text>
      </group>

      {/* Floating Welcome Text */}
      <Text
        position={[0, 4, -5]}
        fontSize={isMobile ? 0.4 : 0.6}
        color="#2563eb"
        anchorX="center"
        anchorY="middle"
      >
        Welcome to my 3D Workspace
      </Text>
      
      <Text
        position={[0, 3, -5]}
        fontSize={isMobile ? 0.15 : 0.2}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        {isMobile 
          ? "Touch to rotate • Pinch to zoom • Tap displays to explore"
          : "Use mouse to navigate • Click displays to explore"
        }
      </Text>
    </group>
  );
}

function Lighting() {
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Main directional light (sunlight through window) */}
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Desk lamp */}
      <pointLight 
        position={[-2, 0, -4]} 
        intensity={0.5} 
        color="#fff8dc"
      />
    </>
  );
}

export default function ThreeWorkspace() {
  const [contextLost, setContextLost] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const mobile = width < 768; // md breakpoint
      
      setIsMobile(mobile);
      
      if (process.env.NODE_ENV?.toLowerCase() === 'development') {
        console.log('Viewport updated:', { width, mobile });
      }
    };

    // Initialize viewport
    updateViewport();
    
    // Add resize listener
    window.addEventListener('resize', updateViewport);
    
    if (process.env.NODE_ENV?.toLowerCase() === 'development') {
      console.log('3D Workspace initializing...');
    }
    
    // Small delay to let React finish mounting/unmounting cycles
    const timer = setTimeout(() => {
      // Check WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        console.error('WebGL is not supported on this browser');
        return;
      }
      
      if (process.env.NODE_ENV?.toLowerCase() === 'development') {
        console.log('WebGL is supported');
        const webglContext = gl as WebGLRenderingContext;
        console.log('WebGL Version:', webglContext.getParameter(webglContext.VERSION));
        console.log('WebGL Vendor:', webglContext.getParameter(webglContext.VENDOR));
        console.log('WebGL Renderer:', webglContext.getParameter(webglContext.RENDERER));
      }
      
      // Clean up test canvas
      canvas.width = 1;
      canvas.height = 1;
      
      setIsReady(true);
    }, 100); // Small delay to avoid React Strict Mode issues
    
    return () => {
      if (process.env.NODE_ENV?.toLowerCase() === 'development') {
        console.log('3D Workspace cleanup');
      }
      clearTimeout(timer);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  const handleRetry = () => {
    console.log('Retrying 3D workspace initialization...');
    setContextLost(false);
    setRetryCount(prev => prev + 1);
    setIsReady(false);
    // Re-initialize after a short delay
    setTimeout(() => setIsReady(true), 100);
  };

  if (contextLost) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-red-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center max-w-md px-4">
          <div className="text-6xl mb-4">🔄</div>
          <h2 className="text-xl font-semibold mb-2">WebGL Context Issue</h2>
          <p className="mb-4 text-sm opacity-90">
            The 3D renderer encountered an issue. This usually resolves on retry.
          </p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin text-4xl mb-4">🌐</div>
          <p>Initializing 3D Environment...</p>
          <p className="text-sm opacity-75 mt-2">Preparing WebGL context</p>
        </div>
      </div>
    );
  }

  // Calculate responsive camera settings
  const getCameraSettings = () => {
    if (isMobile) {
      return {
        position: [0, 3, 12] as [number, number, number], // Further back and higher on mobile
        fov: 85 // Wider FOV on mobile for better overview
      };
    }
    return {
      position: [0, 2, 8] as [number, number, number], // Original desktop position
      fov: 75 // Original desktop FOV
    };
  };

  // Calculate responsive performance settings
  const getPerformanceSettings = () => {
    if (isMobile) {
      return {
        dpr: [0.5, 1] as [number, number], // Lower DPR on mobile
        performance: { min: 0.3 }, // More aggressive performance throttling
        gl: {
          antialias: false, // Disable antialiasing on mobile
          alpha: false,
          powerPreference: "low-power" as const,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
          stencil: false
        }
      };
    }
    return {
      dpr: [1, 1.5] as [number, number],
      performance: { min: 0.5 },
      gl: {
        antialias: true,
        alpha: false,
        powerPreference: "default" as const,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
        stencil: false
      }
    };
  };

  const cameraSettings = getCameraSettings();
  const performanceSettings = getPerformanceSettings();

  return (
    <div ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        key={`canvas-${retryCount}`} // Force remount on retry
        camera={cameraSettings}
        shadows={!isMobile} // Disable shadows on mobile for performance
        gl={performanceSettings.gl}
        dpr={performanceSettings.dpr}
        performance={performanceSettings.performance}
        onCreated={({ gl }) => {
          if (process.env.NODE_ENV?.toLowerCase() === 'development') {
            console.log('Three.js canvas created successfully');
            console.log('Renderer info:', gl.info);
          }
          
          // Handle context loss more gracefully
          const handleContextLost = (event: Event) => {
            console.warn('WebGL context lost - will show retry UI');
            event.preventDefault();
            setContextLost(true);
          };
          
          const handleContextRestored = () => {
            if (process.env.NODE_ENV?.toLowerCase() === 'development') {
              console.log('WebGL context restored successfully');
            }
            setContextLost(false);
          };
          
          gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
          gl.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);
          
          // Return cleanup function
          return () => {
            gl.domElement.removeEventListener('webglcontextlost', handleContextLost);
            gl.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
          };
        }}
        onError={(error) => {
          console.error('Three.js rendering error:', error);
          setContextLost(true);
        }}
      >
        <Lighting />
        <Room />
        <Desk />
        <ProjectDisplays isMobile={isMobile} />
        
        <OrbitControls 
          enablePan={!isMobile} // Disable panning on mobile to avoid conflicts with scrolling
          enableZoom={true}
          enableRotate={true}
          minDistance={isMobile ? 5 : 3} // Prevent getting too close on mobile
          maxDistance={isMobile ? 20 : 15} // Allow more distance on mobile
          maxPolarAngle={Math.PI / 2}
          enableDamping={true}
          dampingFactor={isMobile ? 0.1 : 0.05} // Slightly more damping on mobile
          rotateSpeed={isMobile ? 0.8 : 1} // Slightly slower rotation on mobile
          zoomSpeed={isMobile ? 0.8 : 1} // Slower zoom for better control on mobile
          panSpeed={isMobile ? 0.5 : 1} // Slower pan when enabled
          touches={{
            ONE: isMobile ? 2 : 0, // Single finger rotate on mobile (TOUCH.ROTATE = 2)
            TWO: isMobile ? 1 : 1  // Two finger zoom/pan (TOUCH.DOLLY_PAN = 1)
          }}
        />
      </Canvas>
    </div>
  );
}
