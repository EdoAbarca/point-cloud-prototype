import React, { useState } from 'react';
import axios from 'axios';
import MeshViewer from './components/MeshViewer';

const Loader = () => {
    const [file, setFile] = useState(null);
    const [meshUrl, setMeshUrl] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/upload/', formData);
            const { mesh_path } = await axios.get(`http://localhost:8000/process/${response.data.id}/`).data;
            setMeshUrl(`http://localhost:8000/media/${mesh_path}`);
        } catch (error) {
            console.error("Error processing file:", error);
        }
    };

    return (
        <div>
            <form onSubmit={handleUpload}>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <button type="submit">Upload and Process</button>
            </form>
            {meshUrl && <MeshViewer meshUrl={meshUrl} />}
        </div>
    );
};

export default Loader;
