import { useState } from "react";
import { Link } from "react-router-dom";

const CreateMeshView = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select a point cloud file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/create-mesh", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create mesh.");
      }

      setSuccess("Mesh created successfully!");
      setFile(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Mesh from Point Cloud</h1>
      <Link to="/" className="text-blue-500 underline mb-4 block">
        Back to Home
      </Link>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload Point Cloud File (.pts)
          </label>
          <input
            type="file"
            id="file"
            accept=".pts"
            onChange={handleFileChange}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Create Mesh
        </button>
      </form>
    </div>
  );
};

export default CreateMeshView;
