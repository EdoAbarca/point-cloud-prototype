import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

/**
 * MeshRenderer component that handles the Three.js rendering of triangle meshes
 */
function MeshRenderer({ vertices, triangles, colors, onLoad }) {
  const meshRef = useRef();
  const { camera } = useThree();
  
  useEffect(() => {
    if (vertices && vertices.length > 0 && triangles && triangles.length > 0 && meshRef.current) {
      // Create buffer geometry
      const geometry = new THREE.BufferGeometry();
      
      // Flatten the vertices array
      const verticesArray = new Float32Array(vertices.flat());
      
      // Flatten the triangles (indices) array
      const indicesArray = new Uint32Array(triangles.flat());
      
      // Flatten and normalize colors array (0-1 range)
      const colorsArray = new Float32Array(
        colors.flat().map(c => c <= 1 ? c : c / 255)
      );
      
      geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
      geometry.setIndex(new THREE.BufferAttribute(indicesArray, 1));
      geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
      
      // Compute normals for proper lighting
      geometry.computeVertexNormals();
      
      // Compute bounding sphere for camera positioning
      geometry.computeBoundingSphere();
      
      // Dispose old geometry if it exists
      if (meshRef.current.geometry) {
        meshRef.current.geometry.dispose();
      }
      meshRef.current.geometry = geometry;
      
      // Position camera to see the entire mesh
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
  }, [vertices, triangles, colors, camera, onLoad]);
  
  return (
    <mesh ref={meshRef}>
      <bufferGeometry />
      <meshPhongMaterial
        vertexColors
        side={THREE.DoubleSide}
        flatShading={false}
        shininess={30}
      />
    </mesh>
  );
}

MeshRenderer.propTypes = {
  vertices: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  triangles: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  colors: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  onLoad: PropTypes.func,
};

/**
 * PointCloudRenderer component for rendering point cloud data alongside mesh
 */
function PointCloudRenderer({ positions, colors }) {
  const meshRef = useRef();
  
  useEffect(() => {
    if (positions && positions.length > 0 && meshRef.current) {
      const geometry = new THREE.BufferGeometry();
      
      const positionsArray = new Float32Array(positions.flat());
      const colorsArray = new Float32Array(colors.flat().map(c => c <= 1 ? c : c / 255));
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
      
      if (meshRef.current.geometry) {
        meshRef.current.geometry.dispose();
      }
      meshRef.current.geometry = geometry;
    }
  }, [positions, colors]);
  
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
};

/**
 * MeshViewer component with interactive controls
 */
export default function MeshViewer({ pointCloudId, onError, onBack }) {
  const [meshData, setMeshData] = useState(null);
  const [pointCloudData, setPointCloudData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controlsRef = useRef();
  const [fps, setFps] = useState(0);
  const fpsRef = useRef({ frames: 0, lastTime: Date.now() });
  const [metadata, setMetadata] = useState(null);
  const [viewMode, setViewMode] = useState('mesh'); // 'mesh', 'pointcloud', 'both'
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);

  useEffect(() => {
    fetchMeshData();
    fetchPointCloudData();
  }, [pointCloudId]);

  const fetchMeshData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8000/api/point_cloud/${pointCloudId}/mesh`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Mesh not found. Please generate the mesh first.');
        }
        throw new Error(`Failed to fetch mesh data: ${response.status}`);
      }
      
      const data = await response.json();
      setMeshData(data.data);
      setMetadata(data.metadata);
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

  const fetchPointCloudData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/point_cloud/${pointCloudId}/data?sample=0.3`);
      
      if (!response.ok) {
        console.warn(`Failed to fetch point cloud data: ${response.status}`);
        return; // Don't fail if point cloud data is unavailable
      }
      
      const data = await response.json();
      setPointCloudData(data.data);
    } catch (e) {
      console.warn('Point cloud data unavailable:', e.message);
      // Don't fail the component if point cloud data is unavailable
    }
  };

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const toggleGrid = () => {
    setShowGrid(prev => !prev);
  };

  const toggleAxes = () => {
    setShowAxes(prev => !prev);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key.toLowerCase()) {
        case 'r':
          handleResetView();
          break;
        case 'm':
          setViewMode('mesh');
          break;
        case 'p':
          setViewMode('pointcloud');
          break;
        case 'b':
          setViewMode('both');
          break;
        case 'g':
          toggleGrid();
          break;
        case 'a':
          toggleAxes();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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
          <p className="text-zinc-300">Loading mesh...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 mb-4">{error}</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              Back to Library
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!meshData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">No mesh data available</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Mesh Info Panel */}
      <div className="absolute top-4 left-4 bg-zinc-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-10 max-w-xs">
        <h3 className="text-lg font-semibold text-white mb-2">Mesh Information</h3>
        {metadata && (
          <div className="space-y-1 text-sm text-zinc-300">
            <p><span className="text-zinc-400">Algorithm:</span> {metadata.algorithm || 'N/A'}</p>
            <p><span className="text-zinc-400">Vertices:</span> {metadata.vertices?.toLocaleString() || 'N/A'}</p>
            <p><span className="text-zinc-400">Triangles:</span> {metadata.triangles?.toLocaleString() || 'N/A'}</p>
            {metadata.alpha && (
              <p><span className="text-zinc-400">Alpha:</span> {metadata.alpha}</p>
            )}
            {metadata.processing_time && (
              <p><span className="text-zinc-400">Processing Time:</span> {metadata.processing_time}s</p>
            )}
          </div>
        )}
      </div>

      {/* Controls Panel */}
      <div className="absolute top-4 right-4 bg-zinc-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-10 max-w-xs">
        <h3 className="text-sm font-semibold text-white mb-3">View Controls</h3>
        
        {/* View Mode Toggle */}
        <div className="mb-4">
          <p className="text-xs text-zinc-400 mb-2">Display Mode</p>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => toggleViewMode('mesh')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'mesh' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
              title="Show mesh only (M)"
            >
              Mesh
            </button>
            <button
              onClick={() => toggleViewMode('pointcloud')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'pointcloud' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
              title="Show point cloud only (P)"
              disabled={!pointCloudData}
            >
              Points
            </button>
            <button
              onClick={() => toggleViewMode('both')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'both' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
              title="Show both mesh and points (B)"
              disabled={!pointCloudData}
            >
              Both
            </button>
          </div>
        </div>

        {/* Helper Options */}
        <div className="mb-4">
          <p className="text-xs text-zinc-400 mb-2">Helpers</p>
          <div className="flex gap-2">
            <button
              onClick={toggleGrid}
              className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                showGrid 
                  ? 'bg-green-600 text-white' 
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
              title="Toggle grid (G)"
            >
              Grid
            </button>
            <button
              onClick={toggleAxes}
              className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                showAxes 
                  ? 'bg-green-600 text-white' 
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
              title="Toggle axes (A)"
            >
              Axes
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleResetView}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            title="Reset camera view (R)"
          >
            Reset View
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Back
            </button>
          )}
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-4 pt-3 border-t border-zinc-700">
          <p className="text-xs text-zinc-400 mb-1">Shortcuts:</p>
          <div className="text-xs text-zinc-500 space-y-0.5">
            <p><span className="text-zinc-400">R:</span> Reset view</p>
            <p><span className="text-zinc-400">M/P/B:</span> View mode</p>
            <p><span className="text-zinc-400">G/A:</span> Grid/Axes</p>
          </div>
        </div>
      </div>

      {/* FPS Counter */}
      <div className="absolute bottom-4 right-4 bg-zinc-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-10">
        <p className="text-sm text-zinc-300">
          <span className="text-zinc-400">FPS:</span> <span className="font-mono text-green-400">{fps}</span>
        </p>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [2, 2, 2], fov: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#18181b');
        }}
        className="h-full w-full"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Render Mesh */}
        {(viewMode === 'mesh' || viewMode === 'both') && (
          <MeshRenderer
            vertices={meshData.vertices}
            triangles={meshData.triangles}
            colors={meshData.colors}
            onLoad={() => {
              setLoading(false);
            }}
          />
        )}
        
        {/* Render Point Cloud */}
        {(viewMode === 'pointcloud' || viewMode === 'both') && pointCloudData && (
          <PointCloudRenderer
            positions={pointCloudData.positions}
            colors={pointCloudData.colors}
          />
        )}
        
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={100}
        />
        <FrameCounter onFrame={onFrameRender} />
        {showGrid && <gridHelper args={[10, 10, '#3f3f46', '#27272a']} />}
        {showAxes && <axesHelper args={[1]} />}
      </Canvas>
    </div>
  );
}

MeshViewer.propTypes = {
  pointCloudId: PropTypes.number.isRequired,
  onError: PropTypes.func,
  onBack: PropTypes.func,
};

/**
 * Helper component to track frame renders for FPS calculation
 */
function FrameCounter({ onFrame }) {
  useFrame(() => {
    if (onFrame) {
      onFrame();
    }
  });
  return null;
}

FrameCounter.propTypes = {
  onFrame: PropTypes.func,
};
