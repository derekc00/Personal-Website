"use client"; // This is important for Next.js 13+ app router
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function SpinningCube() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Only run this on the client side
    if (!canvasRef.current) return;

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create scene
    const scene = new THREE.Scene();

    // Set up camera
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    // Create geometry and material
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });

    // Create cube mesh
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(-1, 2, 4);
    scene.add(light);

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    function animate(time: number) {
      time *= 0.001; // Convert time to seconds

      cube.rotation.x = time;
      cube.rotation.y = time;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      // Dispose of resources
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}
