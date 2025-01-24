import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";

const MeshView = () => {
  const [meshes, setMeshes] = useState([]);
  const [selectedMesh, setSelectedMesh] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeshes = async () => {
      try {
        // Todo: Solo leer rutas de archivos .obj
        const response = await fetch("http://localhost:8000/api/send/3d-mesh");
        if (!response.ok) {
          throw new Error("Failed to fetch meshes");
        }
        const data = await response.json();
        setMeshes(data.meshs);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMeshes();
  }, []);

  const handleMeshClick = async (meshPath) => {
    try {
      const loader = new OBJLoader();
      loader.load(
        meshPath,
        (object) => {
          setSelectedMesh(object);
        },
        undefined,
        (err) => {
          setError("Error loading mesh: " + err.message);
        }
      );
    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  const closeModal = () => {
    setSelectedMesh(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">3D Mesh Viewer</h1>
      <Link to="/" className="text-blue-500 underline mb-4 block">Back to Home</Link>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meshes.map((mesh, index) => (
          <div
            key={index}
            className="p-4 border rounded shadow hover:shadow-lg cursor-pointer"
            onClick={() => handleMeshClick(mesh.value)}
          >
            <p className="truncate">{mesh.value}</p>
          </div>
        ))}
      </div>

      {selectedMesh && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-4 w-3/4 h-3/4 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded"
            >
              Close
            </button>

            <Canvas>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 10]} />
              <primitive object={selectedMesh} />
              <OrbitControls />
            </Canvas>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeshView;
