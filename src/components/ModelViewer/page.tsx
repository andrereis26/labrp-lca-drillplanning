"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import config from "@/config/config";

interface ModelViewerProps {
    modelName: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ modelName }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useRef<OrbitControls | null>(null);
    const object = useRef<THREE.Object3D>(new THREE.Object3D());
    const camera = useRef<THREE.PerspectiveCamera>(new THREE.PerspectiveCamera(75, 0, 0.1, 5000));

    useEffect(() => {
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer();


        // check if there's a modelName
        // if (!modelName) return;


        if (!containerRef.current) return;

        // Initialize camera
        camera.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);

        // Initialize renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        // Initialize OrbitControls (only allow zoom)
        controls.current = new OrbitControls(camera.current, renderer.domElement);
        controls.current.enableZoom = true;
        controls.current.enableRotate = false;
        controls.current.enableDamping = false;
        controls.current.enablePan = false;

        // GUI - controls   
        const gui = new GUI();
        // camera controls
        const cameraFolder = gui.addFolder('Camera');
        cameraFolder.add(camera.current.position, 'x', -1000, 1000).name('X').listen();
        cameraFolder.add(camera.current.position, 'y', -1000, 1000).name('Y').listen();
        cameraFolder.add(camera.current.position, 'z', -1000, 1000).name('Z').listen();
        cameraFolder.open();

        // object controls
        const objectFolder = gui.addFolder('Object');
        const objectPosition = {
            x: object.current.position.x,
            y: object.current.position.y,
            z: object.current.position.z
        };

        const objectScale = {
            x: object.current.scale.x,
            y: object.current.scale.y,
            z: object.current.scale.z
        };

        // Add controls for position and scale
        objectFolder.add(objectPosition, 'x', -1000, 1000).name('X').onChange((value) => {
            object.current.position.x = value;
        });
        objectFolder.add(objectPosition, 'y', -1000, 1000).name('Y').onChange((value) => {
            object.current.position.y = value;
        });
        objectFolder.add(objectPosition, 'z', -1000, 1000).name('Z').onChange((value) => {
            object.current.position.z = value;
        });
        objectFolder.add(objectScale, 'x', 0.1, 10).name('Scale X').onChange((value) => {
            object.current.scale.x = value;
        });
        objectFolder.add(objectScale, 'y', 0.1, 10).name('Scale Y').onChange((value) => {
            object.current.scale.y = value;
        });
        objectFolder.add(objectScale, 'z', 0.1, 10).name('Scale Z').onChange((value) => {
            object.current.scale.z = value;
        });
        objectFolder.open();



        // resize renderer on window resize
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            camera.current.aspect = width / height;
            camera.current.updateProjectionMatrix();

            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);


        // Initialize camera position
        camera.current.position.set(-100, -100, -200);
        camera.current.lookAt(0, 0, 0);

        // Add ambient light to the scene
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Add directional light to the scene
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);

        // Load model
        const loader = new OBJLoader();
        const textureLoader = new THREE.TextureLoader();

        // Load OBJ file
        loader.load(config.uploads.folder + "0e66832b-169f-4282-8c16-82c2b28da046.obj", (loadedObject: THREE.Object3D) => {

            loadedObject.traverse((child) => {

                // Set material for the model
                const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
                child.children.forEach((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = material;
                    }
                });

            });

            loadedObject.position.set(0, 0, 0); // Adjust position as needed
            loadedObject.scale.set(2, 2, 2); // Adjust scale as needed

            // Add model to scene
            scene.add(loadedObject);
            object.current = loadedObject;
        },
            (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
            (error) => console.error('An error happened', error)
        );

        // Add a cube to the scene
        // const cubeGeometry = new THREE.BoxGeometry();
        // const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        // const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        // cube.scale.set(6, 6, 6); // Adjust scale as needed
        // scene.add(cube);


        // Animation loop
        const animate = () => {

            // Rotate models
            // cube.rotation.x += 0.01;
            // cube.rotation.y += 0.01;

            controls.current?.update();
            renderer.render(scene, camera.current);
            requestAnimationFrame(animate);

        };

        animate();

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        };
    }, [modelName]);

    // // Function to handle mouse movement
    // const handleMouseMove = (event: MouseEvent) => {
    //     if (event.buttons === 2) { // Check if right mouse button is pressed
    //         const mouseX = event.clientX / window.innerWidth * 2 - 1;
    //         const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    //         const raycaster = new THREE.Raycaster();
    //         const mouseVector = new THREE.Vector2(mouseX, mouseY);
    //         raycaster.setFromCamera(mouseVector, camera);

    //         const intersects = raycaster.intersectObject(object.current, true);

    //         if (intersects.length > 0) {
    //             // Rotate the object based on mouse movement
    //             const intersection = intersects[0];
    //             const point = intersection.point;
    //             const normal = intersection.face!.normal;
    //             object.current.lookAt(point.add(normal));
    //         }
    //     }
    // };

    // // Add contextmenu event listener
    // useEffect(() => {
    //     window.addEventListener('mousemove', handleMouseMove);

    //     // Cleanup on unmount
    //     return () => {
    //         window.removeEventListener('mousemove', handleMouseMove);
    //     };
    // }, []);

    // handle exit button
    const handleExit = () => {
        // clear model from localStorage
        localStorage.removeItem(config.localStorage.modelName);
        // reload the page
        window.location.reload();
    }

    return (
        <div ref={containerRef} >
                {/* exit button in the top left corner */}
                <button
                    className="absolute top-0 left-0 m-4 p-2 bg-gray-800 hover:bg-red-700 text-white rounded"
                    onClick={handleExit}
                >
                    Exit
                </button>
        </div>
    );
};

export default ModelViewer;
