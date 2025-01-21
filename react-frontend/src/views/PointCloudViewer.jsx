import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const PointCloudViewer = () => {
  const [points, setPoints] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').slice(1); // Skip the first line, it contains metadata
        const parsedPoints = lines.map(line => {
          const [x, y, z, intensity, r, g, b] = line.split(' ').map(Number);
          return { position: [x, y, z], color: [r / 255, g / 255, b / 255] };
        });
        setPoints(parsedPoints);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        accept=".txt"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <Canvas className="w-full h-96">
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <Points>
          {points.map((point, index) => (
            <PointMaterial
              key={index}
              position={new THREE.Vector3(...point.position)}
              color={new THREE.Color(...point.color)}
              size={0.05}
            />
          ))}
        </Points>
      </Canvas>
    </div>
  );
};

export default PointCloudViewer;