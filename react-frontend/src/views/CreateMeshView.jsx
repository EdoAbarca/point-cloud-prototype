import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const CreateMeshView = () => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    
    // Auto-fill name from filename if not already set
    if (selectedFile && !name) {
      setName(selectedFile.name.replace('.pts', ''));
    }
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select a point cloud file.");
      return;
    }

    if (!file.name.endsWith('.pts')) {
      setError("Only .pts files are supported.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);
    if (name.trim()) {
      formData.append("name", name.trim());
    }

    try {
      const response = await fetch("http://localhost:8000/api/point_cloud", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          throw new Error(errorMessages);
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error(data.message || "Failed to upload point cloud.");
        }
      }

      setSuccess(`Point cloud "${data.data.name}" uploaded successfully! (${data.data.num_points} points)`);
      setUploadedData(data.data);
      setFile(null);
      setName("");
      
      // Reset file input
      event.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="text-blue-400 hover:text-blue-300 underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Upload Point Cloud</h1>
        <p className="text-zinc-400 mb-8">
          Upload a .pts file to store it in the system and extract metadata.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-800 p-6 rounded-lg">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
            >
              Point Cloud Name (optional)
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Leave empty to use filename"
              className="bg-zinc-700 border border-zinc-600 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium mb-2"
            >
              Point Cloud File (.pts)
            </label>
            <input
              type="file"
              id="file"
              accept=".pts"
              onChange={handleFileChange}
              className="bg-zinc-700 border border-zinc-600 rounded px-4 py-2 w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer"
              disabled={loading}
            />
            <p className="text-zinc-400 text-sm mt-2">
              Supported format: .pts (7-column format: x, y, z, intensity, r, g, b)
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded">
              <p className="font-semibold">Success!</p>
              <p>{success}</p>
              {uploadedData && (
                <div className="mt-2 text-sm">
                  <p>Upload date: {new Date(uploadedData.upload_date).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="bg-blue-900/50 border border-blue-700 text-blue-200 px-4 py-3 rounded flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Uploading and processing point cloud...</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded font-semibold hover:bg-blue-600 disabled:bg-zinc-600 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Uploading..." : "Upload Point Cloud"}
          </button>
        </form>

        {uploadedData && (
          <div className="mt-8 bg-zinc-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Uploaded Point Cloud Metadata</h2>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-zinc-400">ID:</span>
                <span className="font-mono">{uploadedData.id}</span>
                
                <span className="text-zinc-400">Name:</span>
                <span>{uploadedData.name}</span>
                
                <span className="text-zinc-400">Number of Points:</span>
                <span className="font-mono">{uploadedData.num_points.toLocaleString()}</span>
                
                <span className="text-zinc-400">Upload Date:</span>
                <span>{new Date(uploadedData.upload_date).toLocaleString()}</span>
              </div>
              
              {uploadedData.metadata && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                    View Full Metadata
                  </summary>
                  <pre className="mt-2 p-4 bg-zinc-900 rounded text-xs overflow-auto">
                    {JSON.stringify(uploadedData.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateMeshView;
