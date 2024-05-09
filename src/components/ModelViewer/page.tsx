"use client";

import React, { useEffect, useRef, useState } from "react";
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
    // const [controlMode, setControlMode] = useState<'camera' | 'object'>('camera');

    useEffect(() => {
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer();

        // check if there's a modelName
        if (!modelName) return;


        if (!containerRef.current) return;

        // Initialize camera
        camera.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        camera.current.position.set(0, 0, 150);
        camera.current.lookAt(0, 0, 0);

        // Initialize renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        // Initialize OrbitControls 
        controls.current = new OrbitControls(camera.current, renderer.domElement);
        controls.current.enableZoom = true;
        controls.current.enableRotate = true;
        controls.current.enableDamping = true;
        controls.current.enablePan = true;

        // GUI - controls   
        const gui = new GUI();

        // mode control
        // const controlSettingsFolder = gui.addFolder('Control Settings');
        // controlSettingsFolder.add({ controlMode: controlMode }, 'controlMode', ['camera', 'object']).name('Control Mode').onChange((value) => {
        //     setControlMode(value);
        // });
        // controlSettingsFolder.open();

        // camera controls
        const cameraFolder = gui.addFolder('Camera');
        cameraFolder.add(camera.current.position, 'x', -1000, 1000).name('X').listen();
        cameraFolder.add(camera.current.position, 'y', -1000, 1000).name('Y').listen();
        cameraFolder.add(camera.current.position, 'z', -1000, 1000).name('Z').listen();
        cameraFolder.add({ resetCamera: () => resetCameraPosition() }, 'resetCamera').name('Reset Camera');
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
        objectFolder.add({ resetObject: () => resetObjectPositionAndScale() }, 'resetObject').name('Reset Object');
        objectFolder.open();

        // resize renderer on window resize
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            camera.current.aspect = width / height;
            camera.current.updateProjectionMatrix();

            renderer.setSize(width, height);
        };

        // add ambient light to the scene
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // add directional light to the scene
        // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        // directionalLight.position.set(0, 1, 1);
        // scene.add(directionalLight);

        // load model
        const loader = new OBJLoader();
        const textureLoader = new THREE.TextureLoader();

        // load OBJ file
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


        // animation loop
        const animate = () => {
            controls.current?.update();
            renderer.render(scene, camera.current);
            requestAnimationFrame(animate);
        };

        // event listeners
        window.addEventListener('resize', handleResize);        // resize renderer on window resize

        animate();

        // cleanup on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        };
    }, [modelName]);

    // reset camera position
    const resetCameraPosition = () => {
        camera.current.position.set(0, 0, 150);
        camera.current.lookAt(0, 0, 0);
    };

    // reset object position and scale
    const resetObjectPositionAndScale = () => {
        object.current.position.set(0, 0, 0);
        object.current.scale.set(1, 1, 1);
    };

    // handle mouse move event to rotate object
    // const handleMouseMove = (event: MouseEvent) => {
    //     if (event.buttons === 2) {
    //         console.log(controlMode)
    //     }
    //     if (controlMode === 'object' && event.buttons === 2) {
    //         console.log('handleMouseMove');
    //         const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    //         const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    //         const raycaster = new THREE.Raycaster();
    //         const mouseVector = new THREE.Vector2(mouseX, mouseY);
    //         raycaster.setFromCamera(mouseVector, camera.current);

    //         const intersects = raycaster.intersectObject(object.current, true);

    //         if (intersects.length > 0) {
    //             const intersection = intersects[0];
    //             const point = intersection.point;
    //             const normal = intersection.face!.normal;
    //             object.current.lookAt(point.add(normal));
    //         }
    //     }
    // };

    // add event listener for mouse move only when controlMode is 'object'
    // useEffect(() => {
    //     if (controlMode !== 'object') return

    //     window.addEventListener('mousemove', handleMouseMove);
    //     return () => {
    //         window.removeEventListener('mousemove', handleMouseMove);
    //     };

    // }, [controlMode]);

    // update controls based on controlMode
    // useEffect(() => {
    //     if (controls.current) {
    //         controls.current.enableRotate = controlMode === 'camera';
    //         controls.current.enablePan = controlMode === 'camera';
    //     }
    // }, [controlMode]);


    // handle exit button
    const handleExit = () => {
        // clear model from localStorage
        localStorage.removeItem(config.localStorage.modelName);
        // delete file
        fetch(config.apiRoutes.routes.delete, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ modelName: modelName })
        });

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
