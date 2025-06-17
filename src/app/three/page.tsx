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

function ProjectDisplays() {
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
          fontSize={0.3}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          My Projects
        </Text>
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.15}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          Portfolio Gallery
        </Text>
        <Text
          position={[0, -0.5, 0.2]}
          fontSize={0.1}
          color="#999999"
          anchorX="center"
          anchorY="middle"
        >
          Click to explore
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
          fontSize={0.3}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          About Me
        </Text>
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.15}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          Professional Info
        </Text>
        <Text
          position={[0, -0.5, 0.2]}
          fontSize={0.1}
          color="#999999"
          anchorX="center"
          anchorY="middle"
        >
          Click to learn more
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
          fontSize={0.3}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          Blog
        </Text>
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.15}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          Thoughts & Ideas
        </Text>
        <Text
          position={[0, -0.5, 0.2]}
          fontSize={0.1}
          color="#999999"
          anchorX="center"
          anchorY="middle"
        >
          Click to read
        </Text>
      </group>

      {/* Floating Welcome Text */}
      <Text
        position={[0, 4, -5]}
        fontSize={0.6}
        color="#2563eb"
        anchorX="center"
        anchorY="middle"
      >
        Welcome to my 3D Workspace
      </Text>
      
      <Text
        position={[0, 3, -5]}
        fontSize={0.2}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        Use mouse to navigate • Click displays to explore
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
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
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
      
      if (process.env.NODE_ENV === 'development') {
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
      if (process.env.NODE_ENV === 'development') {
        console.log('3D Workspace cleanup');
      }
      clearTimeout(timer);
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

  return (
    <div ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        key={`canvas-${retryCount}`} // Force remount on retry
        camera={{ 
          position: [0, 2, 8], 
          fov: 75 
        }}
        shadows
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "default", // Changed from high-performance to default
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
          stencil: false // Disable stencil buffer to reduce memory usage
        }}
        dpr={[1, 1.5]} // Reduced max DPR
        performance={{ min: 0.5 }}
        onCreated={({ gl }) => {
          if (process.env.NODE_ENV === 'development') {
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
            if (process.env.NODE_ENV === 'development') {
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
        <ProjectDisplays />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
