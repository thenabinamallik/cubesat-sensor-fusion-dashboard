import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SensorData } from "@/types/sensorData";

interface SatelliteModelProps {
  sensorData: SensorData | null;
}

const SatelliteModel = ({ sensorData }: SatelliteModelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  // Keep a reference to the scene for updating
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cubesatRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js components
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color("#f8f9fa");

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Create a simple cube to represent the CubeSat
    const createCubeSat = () => {
      // Main cube body
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x2a4858, 
        shininess: 50,
        specular: 0x111111
      });
      const cube = new THREE.Mesh(geometry, material);
      
      // Create solar panels
      const panelGeometry = new THREE.BoxGeometry(3, 0.1, 1);
      const panelMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x005691, 
        shininess: 100,
        specular: 0x333333
      });
      
      const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
      leftPanel.position.x = -2.5;
      
      const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
      rightPanel.position.x = 2.5;
      
      // Create antenna
      const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
      const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      antenna.position.y = 1.75;
      antenna.rotation.x = Math.PI / 2;
      
      // Create a group to hold all parts
      const satGroup = new THREE.Group();
      satGroup.add(cube);
      satGroup.add(leftPanel);
      satGroup.add(rightPanel);
      satGroup.add(antenna);
      
      // Add coordinate axes
      const axesHelper = new THREE.AxesHelper(3);
      satGroup.add(axesHelper);
      
      scene.add(satGroup);
      return satGroup;
    };

    const cubesat = createCubeSat();
    cubesatRef.current = cubesat;
    
    // Add orbital controls without using the import
    // Implementing a simple controls system
    let isDragging = false;
    let previousMousePosition = {
      x: 0,
      y: 0
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      if (cubesat) {
        cubesat.rotation.y += deltaMove.x * 0.01;
        cubesat.rotation.x += deltaMove.y * 0.01;
      }

      previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Add event listeners for our simple controls
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp);

    // Animation loop
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      
      // Remove event listeners
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mouseleave', handleMouseUp);
      
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update satellite orientation based on sensor data
  useEffect(() => {
    if (!sensorData || !cubesatRef.current) return;

    // Calculate orientation from accelerometer data (for pitch and roll)
    const pitch = Math.atan2(sensorData.accY, Math.sqrt(sensorData.accX ** 2 + sensorData.accZ ** 2)) * (180 / Math.PI);
    const roll = Math.atan2(-sensorData.accX, sensorData.accZ) * (180 / Math.PI);
    
    // Convert to radians for Three.js
    const pitchRad = (pitch * Math.PI) / 180;
    const rollRad = (roll * Math.PI) / 180;
    
    // Apply the rotation
    cubesatRef.current.rotation.x = pitchRad;
    cubesatRef.current.rotation.z = rollRad;
    
  }, [sensorData]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-md overflow-hidden"
      />
      {loadingError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-destructive">{loadingError}</p>
        </div>
      )}
    </div>
  );
};

export default SatelliteModel;
