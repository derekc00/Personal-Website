"use client"; // This is important for Next.js 13+ app router
// @refresh reset // this tells Next.js to refresh the page when the code changes
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

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
    renderer.setClearColor(0x000000, 1); // Set background color to black for better visibility

    // Create scene
    const scene = new THREE.Scene();

    // Set up camera
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000; // Increased far plane to ensure text is visible
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 5; // Moved camera back to see everything

    // Create geometry and material for cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });

    // Create cube mesh
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add lighting (stronger and more lights for better visibility)
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(-1, 2, 4);
    scene.add(light);

    // Add ambient light to ensure the text is visible from all angles
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    // Load font properly
    const fontLoader = new FontLoader();

    // Load the font using the FontLoader
    fontLoader.load(
      "/fonts/helvetiker_regular.typeface.json", // Make sure this path is correct
      (font) => {
        // Create text geometry once font is loaded
        const textGeometry = new TextGeometry("Hello, World!", {
          font: font,
          size: 0.2, // Smaller text size
          depth: 0.05, // Less depth
          curveSegments: 12,
          bevelEnabled: false,
        });

        // Center the text geometry
        textGeometry.computeBoundingBox();
        if (!textGeometry.boundingBox) {
          console.error("Bounding box not computed for text geometry");
          return;
        }
        const textWidth =
          textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;

        // Create text material
        const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position the text in front of the cube
        textMesh.position.set(-textWidth / 2, 0, 1.5);
        scene.add(textMesh);

        console.log("Text added to scene");
      },
      // Progress callback
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // Error callback
      (error) => {
        console.error("An error happened while loading the font:", error);
      }
    );

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
