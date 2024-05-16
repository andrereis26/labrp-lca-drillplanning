"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import config from "@/config/config";
import { useRouter } from 'next/navigation'
import { File } from "@/models/File";

interface ModelViewerProps {
    modelUrl: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ modelUrl }) => {
    const router = useRouter();
    const renderer = useRef<THREE.WebGLRenderer>();
    const gui = useRef<GUI>();
    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useRef<OrbitControls | null>(null);
    const object = useRef<THREE.Object3D>(new THREE.Object3D());
    const camera = useRef<THREE.PerspectiveCamera>(new THREE.PerspectiveCamera(75, 0, 0.1, 5000));
    // const [controlMode, setControlMode] = useState<'camera' | 'object'>('camera');
    const [file, setFile] = useState<File>({
        name: "",
        downloadURL: ""
    });

    useEffect(() => {

        // initialize renderer
        renderer.current = new THREE.WebGLRenderer();

        // initialize scene
        const scene = new THREE.Scene();

        // check if there's a modelName
        if (!modelUrl) return;


        if (!containerRef.current) return;

        // initialize camera
        camera.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        camera.current.position.set(-218.2646848982529, 1483.5522302035865, 1588.6274986528704);
        camera.current.lookAt(0, 0, 0);

        // initialize renderer
        renderer.current.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.current.domElement);

        // add background gray color to the scene
        scene.background = new THREE.Color(0x666666);

        // Initialize helpers and controls
        iniHelpersAndControls(scene);

        // load object
        loadObject(scene);

        // initialize light
        iniLight(scene);

        // add select drills zones selections
        selectDrillZones();

        // animation loop
        const animate = () => {
            controls.current?.update();
            renderer.current?.render(scene, camera.current);
            requestAnimationFrame(animate);
        };

        animate();

        // cleanup on unmount
        return () => {
            gui.current?.destroy();
            renderer.current?.dispose();
        };
    }, [modelUrl]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            camera.current.aspect = width / height;
            camera.current.updateProjectionMatrix();

            renderer.current?.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [modelUrl]);

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
        localStorage.removeItem(config.localStorage.modelUrl);

        // delete file 
        // const response = axios.delete(config.apiRoutes.routes.delete, {
        //     data: { modelName: modelUrl }
        // });

        // redirect to dashboard
        router.push(config.pageRoutes.home);
    }

    // initialize helpers and controls
    const iniHelpersAndControls = (scene: THREE.Scene) => {

        if (!renderer.current || !camera.current || !containerRef.current) return;

        // Initialize OrbitControls 
        controls.current = new OrbitControls(camera.current, renderer.current.domElement);
        controls.current.enableZoom = true;
        controls.current.enableRotate = true;
        controls.current.enableDamping = true;
        controls.current.enablePan = true;

        // add a grid helper to the scene
        const gridHelper = new THREE.GridHelper(5000, 10);
        // show letters on the grid
        scene.add(gridHelper);

        // add axis helper to the scene
        const axesHelper = new THREE.AxesHelper(1000);
        scene.add(axesHelper);

        // GUI - controls   
        gui.current = new GUI();

        // mode control
        // const controlSettingsFolder = gui.current.addFolder('Control Settings');
        // controlSettingsFolder.add({ controlMode: controlMode }, 'controlMode', ['camera', 'object']).name('Control Mode').onChange((value) => {
        //     setControlMode(value);
        // });
        // controlSettingsFolder.open();

        // camera controls
        const cameraFolder = gui.current.addFolder('Camera');
        cameraFolder.add(camera.current.position, 'x', -1000, 1000).name('X (red)').listen();
        cameraFolder.add(camera.current.position, 'y', -1000, 1000).name('Y (green)').listen();
        cameraFolder.add(camera.current.position, 'z', -1000, 1000).name('Z (blue)').listen();
        cameraFolder.add({ resetCamera: () => resetCameraPosition() }, 'resetCamera').name('Reset Camera');
        cameraFolder.open();

        // object controls
        const objectFolder = gui.current.addFolder('Object');
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
        objectFolder.add(objectPosition, 'x', -1000, 1000).name('X (red)').onChange((value: number) => {
            object.current.position.x = value;
        });
        objectFolder.add(objectPosition, 'y', -1000, 1000).name('Y (green)').onChange((value: number) => {
            object.current.position.y = value;
        });
        objectFolder.add(objectPosition, 'z', -1000, 1000).name('Z (blue)').onChange((value: number) => {
            object.current.position.z = value;
        });
        // scale controls
        objectFolder.add(objectScale, 'x', 0.1, 10).name('Scale X,Y,Z').onChange((value: number) => {
            object.current.scale.x = value;
            object.current.scale.y = value;
            object.current.scale.z = value;
        });
        objectFolder.add(objectScale, 'x', 0.1, 10).name('Scale X').onChange((value: number) => {
            object.current.scale.x = value;
        });
        objectFolder.add(objectScale, 'y', 0.1, 10).name('Scale Y').onChange((value: number) => {
            object.current.scale.y = value;
        });
        objectFolder.add(objectScale, 'z', 0.1, 10).name('Scale Z').onChange((value: number) => {
            object.current.scale.z = value;
        });
        // reset object position and scale
        objectFolder.add({ resetObject: () => resetObjectPositionAndScale() }, 'resetObject').name('Reset Object');
        objectFolder.open();

        // add controls for the grid and axis helpers
        const gridFolder = gui.current.addFolder('Grid & Axis');
        gridFolder.add(gridHelper, 'visible').name('Show Grid');
        gridFolder.add(axesHelper, 'visible').name('Show Axis');


        // reset object position and scale
        const resetObjectPositionAndScale = () => {
            object.current.position.set(0, 0, 0);
            object.current.scale.set(1, 1, 1);
        };

        // reset camera position
        const resetCameraPosition = () => {
            camera.current.position.set(0, 0, 150);
            camera.current.lookAt(0, 0, 0);
        };
    }

    // load object
    const loadObject = (scene: THREE.Scene) => {
        // load model
        const loader = new OBJLoader();
        const textureLoader = new THREE.TextureLoader();

        // load OBJ file
        console.log("ssssss")
        console.log(modelUrl)
        loader.load(modelUrl, (loadedObject: THREE.Object3D) => {

            loadedObject.traverse((child) => {

                // Set material for the model
                // const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
                // child.children.forEach((child) => {
                //     if (child instanceof THREE.Mesh) {
                //         child.material = material;
                //     }
                // });

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
    }

    // initialize light
    const iniLight = (scene: THREE.Scene) => {
        // add ambient light to the scene
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        // add directional light to the scene
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 1000, 0);
        scene.add(directionalLight);

    }

    // add select drills zones selections
    const selectDrillZones = () => {

        // add mouse click event on object
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const onClick = (event: MouseEvent) => {
            if (!object.current || !renderer.current) return;

            const rect = renderer.current.domElement.getBoundingClientRect();
            if (!rect) return;

            // calculate mouse position in normalized device coordinates
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // update the picking ray with the camera and mouse position
            raycaster.setFromCamera(mouse, camera.current);

            // calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObject(object.current, true);

            // get the first intersection point
            if (intersects.length > 0) {
                const intersection = intersects[0];
                const point = intersection.point;
                console.log(point);

                // add a sphere at the intersection point
                const sphereGeometry = new THREE.SphereGeometry(2);
                const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                const localPoint = object.current.worldToLocal(point.clone());
                sphere.position.copy(localPoint);
                object.current.add(sphere);

            }
        };

        window.addEventListener('click', onClick);


        return () => {
            window.removeEventListener('click', onClick);
        };
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
