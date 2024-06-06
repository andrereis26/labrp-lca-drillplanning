"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import config from "@/config/config";
import { useRouter } from 'next/navigation'
import axios from "axios";
import { File } from "@/models/File";
import { RxCross2 } from "react-icons/rx";
import { FaHighlighter } from "react-icons/fa";

// notification component
import { notify } from "@/components/Notification/page";
import { DrillZone } from "@/models/DrillZone";
import { Coords } from "@/models/Coords";
import usePrevious from "@/lib/usePrevious";

interface ModelViewerProps {
    file: File;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ file }) => {
    const router = useRouter();
    const renderer = useRef<THREE.WebGLRenderer>();
    const gui = useRef<GUI>();
    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useRef<OrbitControls | null>(null);
    const object = useRef<THREE.Object3D>(new THREE.Object3D());
    const camera = useRef<THREE.PerspectiveCamera>(new THREE.PerspectiveCamera(75, 0, 0.1, 5000));
    const [drillZones, setDrillZones] = useState<THREE.Object3D[]>([]);

    // drill form
    const [highlightedRow, setHighlightedRow] = useState<number>(-1);
    const [highlightedZone, setHighlightedZone] = useState<THREE.Object3D | null>(null);
    const prevHighlighted = usePrevious(highlightedZone);
    const [radius, setRadius] = useState<number>(1);
    const [height, setHeight] = useState<number>(15);
    const [rotation, setRotation] = useState<Coords>({ x: 0, y: 0, z: 0 });
    const [position, setPosition] = useState<Coords>({ x: 0, y: 0, z: 0 });
    const drillRadius = useRef<number>(1);

    const isInitialized = useRef(false);    // check if the component is initialized - to avoid reinitialization in dev mode

    // const [controlMode, setControlMode] = useState<'camera' | 'object'>('camera');

    // initialize everything
    useEffect(() => {

        // this is to avoid reinitialization in dev mode
        if (isInitialized.current) return;

        // initialize renderer
        renderer.current = new THREE.WebGLRenderer();

        // initialize scene
        const scene = new THREE.Scene();

        // check if there's a modelName
        if (!file) return;


        if (!containerRef.current) return;

        // initialize camera
        camera.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        camera.current.position.set(303.6920306726477, 558.439396862245, 386.5463738073414);
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

        // add drills zones handler
        handleDrillZones();

        // animation loop
        const animate = () => {
            controls.current?.update();
            renderer.current?.render(scene, camera.current);
            requestAnimationFrame(animate);
        };

        animate();

        isInitialized.current = true;

        // cleanup on unmount
        return () => {
            // gui.current?.destroy();
            renderer.current?.dispose();
        };
    }, [file]);

    // handle window resize
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
    }, [file]);

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

    useEffect(() => {
        return () => {
            // gui.current?.destroy();
        }
    }, []);

    // handle exit button
    const handleExit = () => {
        gui.current?.destroy();

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

        const objRotation = {
            x: object.current.rotation.x,
            y: object.current.rotation.y,
            z: object.current.rotation.z
        };

        const objectScale = {
            x: object.current.scale.x,
            y: object.current.scale.y,
            z: object.current.scale.z
        };

        // Add controls for position and scale
        objectFolder.add(objectPosition, 'x', -1000, 1000).name('Position X (red)').onChange((value: number) => {
            object.current.position.x = value;
        });
        objectFolder.add(objectPosition, 'y', -1000, 1000).name('Position Y (green)').onChange((value: number) => {
            object.current.position.y = value;
        });
        objectFolder.add(objectPosition, 'z', -1000, 1000).name('Position Z (blue)').onChange((value: number) => {
            object.current.position.z = value;
        });
        // rotation controls
        objectFolder.add(objRotation, 'x', -Math.PI, Math.PI).name('Rotation X (red)').onChange((value: number) => {
            object.current.rotation.x = value;
        });
        objectFolder.add(objRotation, 'y', -Math.PI, Math.PI).name('Rotation Y (green)').onChange((value: number) => {
            object.current.rotation.y = value;
        });
        objectFolder.add(objRotation, 'z', -Math.PI, Math.PI).name('Rotation Z (blue)').onChange((value: number) => {
            object.current.rotation.z = value;
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
        objectFolder.add({ resetObject: () => resetObjectProps() }, 'resetObject').name('Reset Object');
        objectFolder.open();

        // add controls for the grid and axis helpers
        const gridFolder = gui.current.addFolder('Grid & Axis');
        gridFolder.add(gridHelper, 'visible').name('Show Grid');
        gridFolder.add(axesHelper, 'visible').name('Show Axis');

        // add drill radius control
        // const drillFolder = gui.current.addFolder('Drill Zone');
        // drillFolder.add({ radius: drillRadius.current }, 'radius', 0.1, 10).name('Drill Radius').onChange((value: number) => {
        //     drillRadius.current = value;
        // });


        // reset object position and scale
        const resetObjectProps = () => {
            object.current.position.set(0, 0, 0);
            object.current.rotation.set(0, 0, 0);
            object.current.scale.set(1, 1, 1);
        };

        // reset camera position
        const resetCameraPosition = () => {
            camera.current.position.set(-218.2646848982529, 1483.5522302035865, 1588.6274986528704);
            camera.current.lookAt(0, 0, 0);
        };
    }

    // load object
    const loadObject = (scene: THREE.Scene) => {

        notify.info(`Loading 3D model`);

        // load model
        const loader = new OBJLoader();
        const textureLoader = new THREE.TextureLoader();

        // load OBJ file
        loader.load(file.downloadURL, (loadedObject: THREE.Object3D) => {

            notify.clear();

            loadedObject.traverse((child) => {

                // Set material for the model
                // const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
                // child.children.forEach((child) => {
                //     if (child instanceof THREE.Mesh) {
                //         child.material = material;
                //     }
                // });

            });

            loadedObject.position.set(0, 0, 0);
            loadedObject.scale.set(1, 1, 1);

            // Add model to scene
            scene.add(loadedObject);
            object.current = loadedObject;

            // add drill zones to the object if there are any
            if (file.drillZones) {
                file.drillZones.forEach(zone => {

                    // cylinder instead
                    const geometry = new THREE.CylinderGeometry(
                        zone.radius, // radiusTop
                        zone.radius, // radiusBottom
                        zone.height, // height
                        32, // radialSegments
                        1, // heightSegments
                        false, // openEnded
                    );
                    const material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });    // red color
                    const cylinder = new THREE.Mesh(geometry, material);
                    cylinder.position.set(zone.position.x, zone.position.y, zone.position.z);
                    cylinder.rotation.set(zone.rotation.x, zone.rotation.y, zone.rotation.z);
                    object.current.add(cylinder);

                    setDrillZones(prevDrillZones => [...prevDrillZones, cylinder]);
                });
            }
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

    // manage drill zones (add and remove cylinder on object)
    const handleDrillZones = () => {
        let cylinders = [] as THREE.Object3D[];  // i have to use an auxiliary array to store the cylinders because the state is not updated immediately (smth like async state update)
        cylinders = [...drillZones];

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

                // if intersects with a cylinder, remove it
                const intersectedCylinder = intersects.find(intersection => cylinders.includes(intersection.object));
                if (intersectedCylinder) {
                    object.current.remove(intersectedCylinder.object);
                    // remove cylinder from cylinders array and drillZones
                    cylinders.splice(cylinders.indexOf(intersectedCylinder.object), 1);
                    setDrillZones(prevDrillZones => prevDrillZones.filter(zone => zone !== intersectedCylinder.object));
                    return;
                }

                // get the intersection point
                const intersection = intersects[0];
                const point = intersection.point;

                // add a cylinder at the intersection point
                const geometry = new THREE.CylinderGeometry(
                    drillRadius.current, // radiusTop
                    drillRadius.current, // radiusBottom
                    15, // height
                    32, // radialSegments
                    1, // heightSegments
                    false, // openEnded
                );

                const material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });    // red color
                const cylinder = new THREE.Mesh(geometry, material);
                const localPoint = object.current.worldToLocal(point.clone());  // convert world point to local point
                cylinder.position.copy(localPoint);
                object.current.add(cylinder);
                setHighlightedZone(cylinder);   // highlight the new cylinder so the user can update its params
                handleHighlightZone(cylinder);   // highlight the new cylinder so the user can update its params
                // setHighlightedRow(cylinders.length);   // highlight the new cylinder in the list

                cylinders.push(cylinder);
                setDrillZones(prevDrillZones => [...prevDrillZones, cylinder]);

            }
        };

        window.addEventListener('click', onClick);


        return () => {
            window.removeEventListener('click', onClick);
        };
    }

    // highlight useEffect to change the highlighted zone 
    useEffect(() => {
        if (prevHighlighted !== undefined && prevHighlighted !== highlightedZone) {
            // reset color of the previous highlighted zone
            prevHighlighted?.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                }
            });

            if (!highlightedZone) return;

            // highlight the new zone
            highlightedZone.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
                }
            });

            // set the position and rotation of the highlighted zone
            setPosition({
                x: highlightedZone.position.x,
                y: highlightedZone.position.y,
                z: highlightedZone.position.z
            });

            setRotation({
                x: highlightedZone.rotation.x,
                y: highlightedZone.rotation.y,
                z: highlightedZone.rotation.z
            });

            // get the radius and height of the highlighted zone
            const h = ((highlightedZone as THREE.Mesh).geometry as THREE.CylinderGeometry)
            setRadius(h.parameters.radiusTop);
            setHeight(h.parameters.height);
        }

    }, [highlightedZone, prevHighlighted]);

    // highlight zone when selected from the list
    const handleHighlightZone = (zone: THREE.Object3D) => {
        // reset color of the previous highlighted zone
        if (highlightedZone) {
            highlightedZone.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                }
            });

            // check if the zone is the same as the previous one
            if (highlightedZone === zone) {
                setHighlightedZone(null);
                return;
            }
        }

        setHighlightedZone(zone);
        setHighlightedRow(drillZones.findIndex(z => z === zone));
    }

    // delete zone when selected from the list
    const handleDeleteZone = (zone: THREE.Object3D) => {
        // check if the zone is the highlighted one
        if (highlightedZone === zone) {
            setHighlightedZone(null);
        }

        object.current.remove(zone);
        setDrillZones(prevDrillZones => prevDrillZones.filter(z => z !== zone));
        setHighlightedRow(-1);
    }

    // focus on zone when selected from the list
    const focusOnZone = (zone: THREE.Object3D) => {
        const box = new THREE.Box3().setFromObject(zone);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.current.fov * (Math.PI / 180);
        let cameraZ = Math.abs((maxDim / 4) * Math.tan(fov * 2));

        camera.current.position.set(center.x, center.y, center.z + cameraZ);
        camera.current.lookAt(center);
    }

    // clear all drill zones
    const handleClearAllZones = () => {
        setHighlightedZone(null);
        drillZones.forEach(zone => object.current.remove(zone));
        setDrillZones([]);
        setHighlightedRow(-1);
    }

    // submit drill zones
    const handleSubmitDrillZones = () => {
        // send drill zones to the server

        // get position of the drill zones and parse it x, y, z
        // console.log(drillZones);
        const drillZonesPositions = drillZones.map(zone => {
            const position = zone.position; // local position
            const cylinder = (zone as THREE.Mesh).geometry as THREE.CylinderGeometry;   // get cylinder geometry
            const radius = cylinder.parameters.radiusTop;    // get cylinder radius
            const height = cylinder.parameters.height;    // get cylinder height

            return {
                position: {
                    x: position.x,
                    y: position.y,
                    z: position.z
                },
                rotation: {
                    x: zone.rotation.x,
                    y: zone.rotation.y,
                    z: zone.rotation.z,
                    w: zone.quaternion.w
                },
                height: height,
                radius: radius
            };
        });

        // handle file update
        const handleSubmitToServer = async (drillZonesPositions: DrillZone[]) => {
            // send updated file to the server
            try {
                const response = await axios.put(`${config.apiRoutes.base}${config.apiRoutes.routes.files}/${file.name}`,
                    {
                        drillZones: drillZonesPositions
                    });

                if (response.status === 200) {
                    notify.success('Drill zones updated successfully');
                }

            } catch (error) {
                notify.error('Error updating drill zones');
                console.error('Error updating file drill zones:', error);
            }

        }

        // update file with drill zones
        handleSubmitToServer(drillZonesPositions);
    }

    // on changing the drill position, rotation, radius, height
    useEffect(() => {
        if (highlightedZone) {
            highlightedZone.position.set(position.x, position.y, position.z);
            highlightedZone.rotation.set(rotation.x, rotation.y, rotation.z);
            // parse highlighted zone to cylinder
            const h = (highlightedZone as THREE.Mesh).geometry as THREE.CylinderGeometry;
            const updatedGeometry = new THREE.CylinderGeometry(
                radius,
                radius,
                height,
                h.parameters.radialSegments,
                h.parameters.heightSegments,
                h.parameters.openEnded
            );
            (highlightedZone as THREE.Mesh).geometry = updatedGeometry;
        }

    }, [radius, height, position, rotation]);


    return (
        <div ref={containerRef} >
            {/* exit button in the top left corner */}
            <button
                className="absolute top-0 left-0 m-4 p-2 bg-gray-800 hover:bg-red-700 text-white rounded"
                onClick={handleExit}
            >
                Exit
            </button>

            <div className="absolute bottom-0 left-0 m-4">

                {/* small UI to change the params of the selected cylinder  */}
                {highlightedZone && (
                    <div className="p-2 bg-white dark:bg-gray-900 rounded mb-2">
                        <ul className="cursor-pointer">
                            <li className="pb-1">
                                <span className="text-black dark:text-white">Selected Cylinder</span>
                            </li>
                            {/* radius */}
                            <li className="pb-1">
                                <span className="text-black dark:text-white">Radius: </span>
                                <input
                                    type="range"
                                    min={0.1}
                                    max={100}
                                    step={0.001}
                                    value={radius}
                                    onChange={(e) => setRadius(parseFloat(e.target.value))}
                                    placeholder="Radius"
                                    className="border rounded"
                                />
                                <input
                                    type="number"
                                    min={0.1}
                                    max={100}
                                    step={0.001}
                                    value={radius}
                                    onChange={(e) => setRadius(parseFloat(e.target.value))}
                                    className="border rounded ml-1"
                                />
                            </li>
                            {/* height */}
                            <li className="pb-1">
                                <span className="text-black dark:text-white">Height: </span>
                                <input
                                    type="range"
                                    min={1}
                                    max={100}
                                    step={0.001}
                                    value={height}
                                    onChange={(e) => setHeight(parseFloat(e.target.value))}
                                    placeholder="Height"
                                    className="border rounded"
                                />
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    step={0.001}
                                    value={height}
                                    onChange={(e) => setHeight(parseFloat(e.target.value))}
                                    className="border rounded ml-1"
                                />
                            </li>
                            <hr className="border-gray-600" />
                            {/* position */}
                            <li className="pb-1">
                                <span className="text-black dark:text-white">Position</span>
                            </li>
                            <li className="pb-1">
                                <span className="text-black dark:text-white">X:</span>
                                <input
                                    type="range"
                                    min={-1000}
                                    max={1000}
                                    step={0.001}
                                    value={position.x}
                                    onChange={(e) => setPosition({ ...position, x: parseFloat(e.target.value) })}
                                    placeholder="Position X"
                                    className="border rounded"
                                />
                                <input
                                    type="number"
                                    min={-1000}
                                    max={1000}
                                    step={0.001}
                                    value={position.x}
                                    onChange={(e) => setPosition({ ...position, x: parseFloat(e.target.value) })}
                                    className="border rounded ml-1"
                                />
                            </li>
                            <li className="pb-1">
                                <span className="text-black dark:text-white">Y:</span>
                                <input
                                    type="range"
                                    min={-1000}
                                    max={1000}
                                    step={0.001}
                                    value={position.y}
                                    onChange={(e) => setPosition({ ...position, y: parseFloat(e.target.value) })}
                                    placeholder="Position Y"
                                    className="border rounded"
                                />
                                <input
                                    type="number"
                                    min={-1000}
                                    max={1000}
                                    step={0.001}
                                    value={position.y}
                                    onChange={(e) => setPosition({ ...position, y: parseFloat(e.target.value) })}
                                    className="border rounded ml-1"
                                />
                            </li>
                            <li className="pb-1">
                                <span className="text-black dark:text-white">Z:</span>
                                <input
                                    type="range"
                                    min={-1000}
                                    max={1000}
                                    step={0.001}
                                    value={position.z}
                                    onChange={(e) => setPosition({ ...position, z: parseFloat(e.target.value) })}
                                    placeholder="Position Z"
                                    className="border rounded"
                                />
                                <input
                                    type="number"
                                    min={-100}
                                    max={100}
                                    step={0.001}
                                    value={position.z}
                                    onChange={(e) => setPosition({ ...position, z: parseFloat(e.target.value) })}
                                    className="border rounded ml-1"
                                />
                            </li>
                            {/* rotation */}
                            <li className="pb-1">
                                <span className="text-black dark:text-white">Rotation</span>
                            </li>
                            <li className="pb-1">
                                <span className="text-black dark:text-white">X:</span>
                                <input
                                    type="range"
                                    min={-180}
                                    max={180}
                                    step={0.001}
                                    value={rotation.x}
                                    onChange={(e) => setRotation({ ...rotation, x: parseFloat(e.target.value) })}
                                    placeholder="Rotation X"
                                    className="border rounded"
                                />
                                <input
                                    type="number"
                                    min={-180}
                                    max={180}
                                    step={0.001}
                                    value={rotation.x}
                                    onChange={(e) => setRotation({ ...rotation, x: parseFloat(e.target.value) })}
                                    className="border rounded ml-1"
                                />
                            </li>
                            <li className="pb-1">
                                <span className="text-black dark:text-white">Y:</span>
                                <input
                                    type="range"
                                    min={-180}
                                    max={180}
                                    step={0.001}
                                    value={rotation.y}
                                    onChange={(e) => setRotation({ ...rotation, y: parseFloat(e.target.value) })}
                                    placeholder="Rotation Y"
                                    className="border rounded"
                                />
                                <input
                                    type="number"
                                    min={-180}
                                    max={180}
                                    step={0.001}
                                    value={rotation.y}
                                    onChange={(e) => setRotation({ ...rotation, y: parseFloat(e.target.value) })}
                                    className="border rounded ml-1"
                                />
                            </li>
                            <li className="pb-1">
                                <span className="text-black dark:text-white">Z:</span>
                                <input
                                    type="range"
                                    min={-180}
                                    max={180}
                                    step={0.001}
                                    value={rotation.z}
                                    onChange={(e) => setRotation({ ...rotation, z: parseFloat(e.target.value) })}
                                    placeholder="Rotation Z"
                                    className="border rounded"
                                />
                                <input
                                    type="number"
                                    min={-180}
                                    max={180}
                                    step={0.001}
                                    value={rotation.z}
                                    onChange={(e) => setRotation({ ...rotation, z: parseFloat(e.target.value) })}
                                    className="border rounded ml-1"
                                />
                            </li>
                        </ul>
                    </div>
                )}
                {/* small UI list in the bottom left corner */}
                <div className="p-2 bg-white dark:bg-gray-900 rounded">
                    <ul className="cursor-pointer">
                        {/* if drill zones empty show message */}
                        {drillZones.length === 0 && <li>No drill zones</li>}

                        {drillZones.length > 0 && (
                            <>
                                <li className="flex items-center justify-center pb-4">
                                    <button
                                        className="bg-red-700 hover:bg-red-800 text-white rounded p-1"
                                        onClick={handleClearAllZones}
                                    >
                                        Clear All
                                    </button>
                                </li>
                                <hr className="border-gray-600 pb-1" />
                                {drillZones.map((zone, index) => (
                                    <li key={index} className={`pb-1 border-b ${highlightedRow === index ? 'bg-gray-300 dark:bg-gray-600' : ''}`}>
                                        <span className="text-black dark:text-white" onClick={() => {
                                            handleHighlightZone(zone)
                                        }}>Drill Zone {index + 1}</span>
                                        <FaHighlighter className="inline-block ml-2 cursor-pointer" color="yellow"
                                            onClick={() => handleHighlightZone(zone)}
                                        />
                                        <RxCross2 className="inline-block ml-2 cursor-pointer" color="red" onClick={
                                            () => handleDeleteZone(zone)
                                        } />
                                    </li>
                                ))}
                                <hr className="border-gray-600" />
                            </>
                        )}
                        <li className="flex items-center justify-center pt-4">
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white rounded p-1"
                                onClick={handleSubmitDrillZones}
                            >
                                Submit
                            </button>
                        </li>

                    </ul>
                </div>
            </div>


        </div>
    );
};

export default ModelViewer;
