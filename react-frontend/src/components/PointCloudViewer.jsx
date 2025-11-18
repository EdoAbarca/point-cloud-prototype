import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

/**
 * PointCloudRenderer component that handles the Three.js rendering of point clouds
 */
function PointCloudRenderer({ positions, colors, onLoad }) {
  const meshRef = useRef();
  const { camera, gl } = useThree();
  
  useEffect(() => {
    if (positions && positions.length > 0 && meshRef.current) {
      // Create buffer geometry
      const geometry = new THREE.BufferGeometry();
      
      // Flatten the positions and colors arrays
      const positionsArray = new Float32Array(positions.flat());
      const colorsArray = new Float32Array(colors.flat().map(c => c / 255)); // Normalize to 0-1
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
      
      // Compute bounding sphere for camera positioning
      geometry.computeBoundingSphere();
      
      // Dispose old geometry if it exists
      if (meshRef.current.geometry) {
        meshRef.current.geometry.dispose();
      }
      meshRef.current.geometry = geometry;
      
      // Position camera to see the entire point cloud
      if (geometry.boundingSphere) {
        const center = geometry.boundingSphere.center;
        const radius = geometry.boundingSphere.radius;
        
        camera.position.set(
          center.x + radius * 1.5,
          center.y + radius * 1.5,
          center.z + radius * 1.5
        );
        camera.lookAt(center);
        camera.updateProjectionMatrix();
      }
      
      if (onLoad) {
        onLoad();
      }
    }
  }, [positions, colors, camera, onLoad]);
  
  return (
    <points ref={meshRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.01}
        vertexColors
        sizeAttenuation={true}
        transparent={false}
      />
    </points>
  );
}

PointCloudRenderer.propTypes = {
  positions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  colors: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  onLoad: PropTypes.func,
};

/**
 * PointCloudViewer component with interactive controls
 */
export default function PointCloudViewer({ pointCloudId, onError }) {
  const [pointCloudData, setPointCloudData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controlsRef = useRef();
  const [fps, setFps] = useState(0);
  const fpsRef = useRef({ frames: 0, lastTime: Date.now() });

  useEffect(() => {
    fetchPointCloudData();
  }, [pointCloudId]);

  const fetchPointCloudData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch with sampling for large point clouds
      const response = await fetch(`http://localhost:8000/api/point_cloud/${pointCloudId}/data?sample=0.5`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch point cloud data: ${response.status}`);
      }
      
      const data = await response.json();
      setPointCloudData(data.data);
    } catch (e) {
      const errorMessage = e.message;
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // FPS counter
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - fpsRef.current.lastTime;
      const currentFps = Math.round((fpsRef.current.frames * 1000) / elapsed);
      setFps(currentFps);
      fpsRef.current.frames = 0;
      fpsRef.current.lastTime = now;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const onFrameRender = () => {
    fpsRef.current.frames += 1;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-zinc-300">Loading point cloud...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded">
          <p className="font-semibold mb-2">Error loading point cloud</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!pointCloudData || !pointCloudData.positions || pointCloudData.positions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">No point cloud data available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* FPS Counter */}
      <div className="absolute top-4 left-4 bg-black/50 px-3 py-2 rounded text-xs font-mono text-white z-10">
        FPS: {fps}
      </div>

      {/* Reset View Button */}
      <button
        onClick={handleResetView}
        className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium z-10 transition-colors"
        title="Reset camera view to default position (R)"
      >
        Reset View
      </button>

      {/* Controls Info */}
      <div className="absolute bottom-4 left-4 bg-black/50 px-4 py-3 rounded text-xs text-white z-10">
        <p className="font-semibold mb-1">Controls:</p>
        <ul className="space-y-1">
          <li>🖱️ Left click + drag: Rotate</li>
          <li>🖱️ Right click + drag: Pan</li>
          <li>🖱️ Scroll: Zoom</li>
          <li>⌨️ Press R: Reset view</li>
        </ul>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [2, 2, 2], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#18181b'); // zinc-900
        }}
        onPointerMissed={onFrameRender}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <PointCloudRenderer
          positions={pointCloudData.positions}
          colors={pointCloudData.colors}
          onLoad={() => setLoading(false)}
        />
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          panSpeed={0.5}
          minDistance={0.1}
          maxDistance={100}
          makeDefault
        />
      </Canvas>
    </div>
  );
}

PointCloudViewer.propTypes = {
  pointCloudId: PropTypes.number.isRequired,
  onError: PropTypes.func,
};
