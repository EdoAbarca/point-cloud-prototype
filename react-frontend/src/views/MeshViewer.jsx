import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MeshViewer = ({ meshUrl }) => {
    const mountRef = useRef(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Cargar malla
        const loader = new THREE.ObjectLoader();
        loader.load(meshUrl, (object) => {
            scene.add(object);
        });

        camera.position.z = 5;

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        return () => mountRef.current.removeChild(renderer.domElement);
    }, [meshUrl]);

    return <div ref={mountRef} />;
};

export default MeshViewer;
