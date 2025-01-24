import { useState, useEffect } from "react";
import * as THREE from "three";

export default function PointsView() {
    const [filePath, setFilePath] = useState("");
    const [pointCloud, setPointCloud] = useState(null);
    const [error, setError] = useState(null);

    const fetchPointCloud = async (path) => {
        try {
            // Todo: Solo leer rutas de archivos .pts
            const response = await fetch(`http://localhost:8000/api/send/poind-cloud?filepath=${encodeURIComponent(path)}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            setPointCloud(data.point_clouds[0]);
        } catch (e) {
            setError(e.message);
        }
    };

    const handleFilePathSubmit = () => {
        if (filePath.trim() === "") {
            setError("Por favor, ingresa una ruta válida para el archivo.");
            return;
        }

        setError(null);
        fetchPointCloud(filePath);
    };

    const renderPointCloud = () => {
        if (!pointCloud) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("point-cloud-viewer").appendChild(renderer.domElement);

        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(pointCloud.point_cloud.flat());
        geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
        const points = new THREE.Points(geometry, material);

        scene.add(points);
        camera.position.z = 5;

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };

        animate();
    };

    useEffect(() => {
        if (pointCloud) {
            renderPointCloud();
        }
    }, [pointCloud]);

    return (
        <div className="p-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-xl font-bold mb-4">Visualización de Nubes de Puntos</h1>

                <div className="flex items-center gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Ruta absoluta del archivo .pts"
                        value={filePath}
                        onChange={(e) => setFilePath(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <button onClick={handleFilePathSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Cargar
                    </button>
                </div>

                {error && <p className="text-red-500">{error}</p>}
                {!error && pointCloud && (
                    <p className="text-green-500">Nube de puntos cargada correctamente.</p>
                )}

                <div>
                    <button
                        onClick={() => document.getElementById("dialog").showModal()}
                        disabled={!pointCloud}
                        className={`bg-blue-500 text-white px-4 py-2 rounded ${!pointCloud ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        Visualizar
                    </button>
                    <dialog id="dialog" className="w-[800px] h-[600px] p-0">
                        <div className="w-full h-full">
                            <div id="point-cloud-viewer" className="w-full h-full"></div>
                        </div>
                        <button onClick={() => document.getElementById("dialog").close()} className="absolute top-2 right-2">
                            Close
                        </button>
                    </dialog>
                </div>
            </div>
        </div>
    );
}
