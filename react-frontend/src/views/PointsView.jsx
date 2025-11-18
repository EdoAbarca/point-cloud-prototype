import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PointCloudViewer from "../components/PointCloudViewer";
import MeshViewer from "../components/MeshViewer";

export default function PointsView() {
    const [pointClouds, setPointClouds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCloud, setSelectedCloud] = useState(null);
    const [generatingMesh, setGeneratingMesh] = useState(null);
    const [viewMode, setViewMode] = useState('cloud'); // 'cloud' or 'mesh'
    const [alphaValue, setAlphaValue] = useState(1.0);
    const [meshAlgorithm, setMeshAlgorithm] = useState('delaunay'); // 'delaunay', 'poisson', or 'threshold'
    const [poissonDepth, setPoissonDepth] = useState(9);
    const [poissonRadius, setPoissonRadius] = useState(0.1);
    const [poissonMaxNN, setPoissonMaxNN] = useState(30);
    const [thresholdValue, setThresholdValue] = useState(0.5);
    const [thresholdAlpha, setThresholdAlpha] = useState(1.0);

    const fetchPointClouds = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:8000/api/point_cloud");

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            setPointClouds(data.data || []);
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const deletePointCloud = async (id) => {
        if (!confirm("Are you sure you want to delete this point cloud?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/point_cloud/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete point cloud");
            }

            // Refresh the list
            fetchPointClouds();
        } catch (e) {
            alert(`Error: ${e.message}`);
        }
    };

    const generateMesh = async (cloudId, algorithm = 'delaunay', params = {}) => {
        setGeneratingMesh(cloudId);
        setError(null);

        try {
            let url, body;
            
            if (algorithm === 'delaunay') {
                url = `http://localhost:8000/api/point_cloud/${cloudId}/triangulate`;
                body = JSON.stringify({ alpha: params.alpha || 1.0 });
            } else if (algorithm === 'poisson') {
                url = `http://localhost:8000/api/point_cloud/${cloudId}/reconstruct_poisson`;
                body = JSON.stringify({
                    depth: params.depth || 9,
                    radius: params.radius || 0.1,
                    max_nn: params.max_nn || 30
                });
            } else if (algorithm === 'threshold') {
                url = `http://localhost:8000/api/point_cloud/${cloudId}/threshold`;
                body = JSON.stringify({
                    threshold: params.threshold || 0.5,
                    alpha: params.alpha || 1.0
                });
            } else {
                throw new Error('Invalid algorithm');
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: body,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to generate mesh");
            }

            const data = await response.json();
            
            // Refresh the point cloud data
            await fetchPointClouds();
            
            // Switch to mesh view
            setViewMode('mesh');
            
            const algorithmName = algorithm === 'delaunay' ? 'Delaunay' : algorithm === 'poisson' ? 'Poisson' : 'Threshold';
            let successMessage = `${algorithmName} mesh generated successfully!\nVertices: ${data.data.vertices.toLocaleString()}\nTriangles: ${data.data.triangles.toLocaleString()}\nTime: ${data.data.processing_time}s`;
            
            // Add filtering stats for threshold algorithm
            if (algorithm === 'threshold' && data.data.filtering_stats) {
                const stats = data.data.filtering_stats;
                successMessage += `\n\nFiltering Stats:\nOriginal Points: ${stats.points_original.toLocaleString()}\nFiltered Points: ${stats.points_filtered.toLocaleString()}\nRemoved: ${stats.points_removed.toLocaleString()} (${stats.removal_percentage}%)`;
            }
            
            alert(successMessage);
        } catch (e) {
            setError(e.message);
            alert(`Error generating mesh: ${e.message}`);
        } finally {
            setGeneratingMesh(null);
        }
    };

    useEffect(() => {
        fetchPointClouds();
    }, []);

    return (
        <div className="min-h-screen bg-zinc-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/" className="text-blue-400 hover:text-blue-300 underline">
                        ← Back to Home
                    </Link>
                    <Link
                        to="/create-mesh"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        + Upload New Point Cloud
                    </Link>
                </div>

                <h1 className="text-3xl font-bold mb-6">Point Cloud Library</h1>
                <p className="text-zinc-400 mb-8">
                    View and manage all uploaded point cloud files.
                </p>

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="ml-3">Loading point clouds...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">
                        <p className="font-semibold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && pointClouds.length === 0 && (
                    <div className="bg-zinc-800 rounded-lg p-8 text-center">
                        <p className="text-zinc-400 mb-4">No point clouds uploaded yet.</p>
                        <Link
                            to="/create-mesh"
                            className="inline-block bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
                        >
                            Upload Your First Point Cloud
                        </Link>
                    </div>
                )}

                {!loading && !error && pointClouds.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pointClouds.map((cloud) => (
                            <div
                                key={cloud.id}
                                className="bg-zinc-800 rounded-lg p-6 hover:bg-zinc-750 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold truncate flex-1">
                                        {cloud.name}
                                    </h3>
                                    <button
                                        onClick={() => deletePointCloud(cloud.id)}
                                        className="text-red-400 hover:text-red-300 ml-2"
                                        title="Delete"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Points:</span>
                                        <span className="font-mono">{cloud.num_points.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Uploaded:</span>
                                        <span className="text-xs">
                                            {new Date(cloud.upload_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">ID:</span>
                                        <span className="font-mono text-xs">{cloud.id}</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => setSelectedCloud(cloud)}
                                        className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded transition-colors text-sm"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedCloud(cloud);
                                            setViewMode('cloud');
                                        }}
                                        disabled={generatingMesh === cloud.id}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors text-sm disabled:bg-blue-800 disabled:cursor-not-allowed"
                                    >
                                        {generatingMesh === cloud.id ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Generating...
                                            </span>
                                        ) : cloud.mesh_file ? (
                                            "View Mesh"
                                        ) : (
                                            "Generate Mesh"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedCloud && (
                    <div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
                        onClick={() => {
                            setSelectedCloud(null);
                            setViewMode('cloud');
                        }}
                    >
                        <div
                            className="bg-zinc-800 rounded-lg p-6 w-full h-full max-w-7xl max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedCloud.name}</h2>
                                    <p className="text-sm text-zinc-400 mt-1">
                                        {selectedCloud.num_points.toLocaleString()} points
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedCloud(null);
                                        setViewMode('cloud');
                                    }}
                                    className="text-zinc-400 hover:text-white"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* View Toggle and Controls */}
                            <div className="flex gap-4 mb-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewMode('cloud')}
                                        className={`px-4 py-2 rounded transition-colors ${
                                            viewMode === 'cloud'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                        }`}
                                    >
                                        Point Cloud
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedCloud.mesh_file) {
                                                setViewMode('mesh');
                                            } else {
                                                alert('Generate mesh first');
                                            }
                                        }}
                                        className={`px-4 py-2 rounded transition-colors ${
                                            viewMode === 'mesh'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                        } ${!selectedCloud.mesh_file ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!selectedCloud.mesh_file}
                                    >
                                        Mesh View
                                    </button>
                                </div>

                                {viewMode === 'cloud' && (
                                    <div className="flex items-center gap-2 ml-auto flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-zinc-400">Algorithm:</label>
                                            <select
                                                value={meshAlgorithm}
                                                onChange={(e) => setMeshAlgorithm(e.target.value)}
                                                className="px-2 py-1 bg-zinc-700 text-white rounded text-sm"
                                            >
                                                <option value="delaunay">Delaunay</option>
                                                <option value="poisson">Poisson</option>
                                                <option value="threshold">Threshold</option>
                                            </select>
                                        </div>

                                        {meshAlgorithm === 'delaunay' && (
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-zinc-400">Alpha:</label>
                                                <input
                                                    type="number"
                                                    min="0.1"
                                                    max="5"
                                                    step="0.1"
                                                    value={alphaValue}
                                                    onChange={(e) => setAlphaValue(parseFloat(e.target.value))}
                                                    className="w-20 px-2 py-1 bg-zinc-700 text-white rounded text-sm"
                                                />
                                            </div>
                                        )}

                                        {meshAlgorithm === 'poisson' && (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm text-zinc-400">Depth:</label>
                                                    <input
                                                        type="number"
                                                        min="5"
                                                        max="12"
                                                        step="1"
                                                        value={poissonDepth}
                                                        onChange={(e) => setPoissonDepth(parseInt(e.target.value))}
                                                        className="w-16 px-2 py-1 bg-zinc-700 text-white rounded text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm text-zinc-400">Radius:</label>
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        max="1"
                                                        step="0.01"
                                                        value={poissonRadius}
                                                        onChange={(e) => setPoissonRadius(parseFloat(e.target.value))}
                                                        className="w-20 px-2 py-1 bg-zinc-700 text-white rounded text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm text-zinc-400">Max NN:</label>
                                                    <input
                                                        type="number"
                                                        min="10"
                                                        max="100"
                                                        step="5"
                                                        value={poissonMaxNN}
                                                        onChange={(e) => setPoissonMaxNN(parseInt(e.target.value))}
                                                        className="w-16 px-2 py-1 bg-zinc-700 text-white rounded text-sm"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {meshAlgorithm === 'threshold' && (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm text-zinc-400" title="Density threshold for filtering. Lower = keep more points, Higher = remove more points">Threshold:</label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="2"
                                                        step="0.1"
                                                        value={thresholdValue}
                                                        onChange={(e) => setThresholdValue(parseFloat(e.target.value))}
                                                        className="w-24"
                                                    />
                                                    <span className="text-xs font-mono bg-zinc-700 px-2 py-1 rounded">{thresholdValue.toFixed(1)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm text-zinc-400">Alpha:</label>
                                                    <input
                                                        type="number"
                                                        min="0.1"
                                                        max="5"
                                                        step="0.1"
                                                        value={thresholdAlpha}
                                                        onChange={(e) => setThresholdAlpha(parseFloat(e.target.value))}
                                                        className="w-20 px-2 py-1 bg-zinc-700 text-white rounded text-sm"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <button
                                            onClick={() => {
                                                let params;
                                                if (meshAlgorithm === 'delaunay') {
                                                    params = { alpha: alphaValue };
                                                } else if (meshAlgorithm === 'poisson') {
                                                    params = { depth: poissonDepth, radius: poissonRadius, max_nn: poissonMaxNN };
                                                } else if (meshAlgorithm === 'threshold') {
                                                    params = { threshold: thresholdValue, alpha: thresholdAlpha };
                                                }
                                                generateMesh(selectedCloud.id, meshAlgorithm, params);
                                            }}
                                            disabled={generatingMesh === selectedCloud.id}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm disabled:bg-green-800 disabled:cursor-not-allowed"
                                        >
                                            {generatingMesh === selectedCloud.id ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Generating...
                                                </span>
                                            ) : selectedCloud.mesh_file ? (
                                                "Regenerate Mesh"
                                            ) : (
                                                "Generate Mesh"
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 3D Visualization */}
                            <div className="flex-1 bg-zinc-900 rounded-lg overflow-hidden mb-4">
                                {viewMode === 'cloud' ? (
                                    <PointCloudViewer
                                        pointCloudId={selectedCloud.id}
                                        onError={(err) => setError(err)}
                                    />
                                ) : (
                                    <MeshViewer
                                        pointCloudId={selectedCloud.id}
                                        onError={(err) => setError(err)}
                                    />
                                )}
                            </div>

                            {/* Metadata Section */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-zinc-400">ID:</span>
                                    <p className="font-mono">{selectedCloud.id}</p>
                                </div>
                                <div>
                                    <span className="text-zinc-400">Upload Date:</span>
                                    <p className="text-xs">{new Date(selectedCloud.upload_date).toLocaleDateString()}</p>
                                </div>
                                {selectedCloud.mesh_metadata?.algorithm && (
                                    <div>
                                        <span className="text-zinc-400">Mesh Algorithm:</span>
                                        <p className="font-mono text-xs capitalize">{selectedCloud.mesh_metadata.algorithm}</p>
                                    </div>
                                )}
                                {selectedCloud.mesh_metadata?.vertices && (
                                    <div>
                                        <span className="text-zinc-400">Mesh Vertices:</span>
                                        <p className="font-mono text-xs">{selectedCloud.mesh_metadata.vertices.toLocaleString()}</p>
                                    </div>
                                )}
                                {selectedCloud.mesh_metadata?.algorithm === 'threshold' && selectedCloud.mesh_metadata?.points_filtered && (
                                    <div>
                                        <span className="text-zinc-400">Points Filtered:</span>
                                        <p className="font-mono text-xs">{selectedCloud.mesh_metadata.points_filtered.toLocaleString()} / {selectedCloud.mesh_metadata.points_original.toLocaleString()}</p>
                                    </div>
                                )}
                                {selectedCloud.mesh_metadata?.algorithm === 'threshold' && selectedCloud.mesh_metadata?.removal_percentage && (
                                    <div>
                                        <span className="text-zinc-400">Removed:</span>
                                        <p className="font-mono text-xs">{selectedCloud.mesh_metadata.removal_percentage}%</p>
                                    </div>
                                )}
                                {selectedCloud.metadata?.bounds && (
                                    <>
                                        <div>
                                            <span className="text-zinc-400">Bounds X:</span>
                                            <p className="font-mono text-xs">
                                                [{selectedCloud.metadata.bounds.x.min.toFixed(2)}, {selectedCloud.metadata.bounds.x.max.toFixed(2)}]
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-zinc-400">Bounds Y:</span>
                                            <p className="font-mono text-xs">
                                                [{selectedCloud.metadata.bounds.y.min.toFixed(2)}, {selectedCloud.metadata.bounds.y.max.toFixed(2)}]
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
