import React from 'react';
import * as THREE from 'three'
import { useState , useEffect, useRef , Suspense } from 'react';
import { Canvas,  useThree } from '@react-three/fiber'
import { Environment , Edges , FirstPersonControls , OrbitControls , Html } from '@react-three/drei'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import { VolumeSelectionBox } from './VolumeSelectionBox'
import OctreeTest from './OctreeTest'
import * as Loggers from './Loggers'
//position={[-0.5,1.10,8]} rotation={[-Math.PI/2, 0, Math.PI/2]}


let invalidateRef = null
let cameraRef = null
const binaryPLYFile = "/point_clouds/UFO_2735.ply"

// Helper to create an invisible mathematical plane facing the camera
const dragPlane = new THREE.Plane();
const planeIntersectPoint = new THREE.Vector3();

export function invalidateCanvas() {
  console.log('invalidated')
  invalidateRef?.()
}

export function getCamera() {
  return cameraRef
}

const BackgroundManager = ({ skyboxVisible, skyboxPreset, backgroundVisible, backgroundColor }) => {
  const { scene, invalidate } = useThree();

  useEffect(() => {
    if (!skyboxVisible) {
      if (backgroundVisible) {
        scene.background = new THREE.Color(backgroundColor);
      } else {
        scene.background = null;
      }
    }
    setTimeout(() => invalidate(), 1);
  }, [skyboxVisible, backgroundVisible, backgroundColor]);

  if (skyboxVisible) {
    return (
      <Suspense fallback={null}>
        <Environment
          key={skyboxPreset}
          preset={skyboxPreset}
          background
          onLoad={() => invalidate()}
        />
      </Suspense>
    )
  }

  return null;
};

function Canvas3D({ octreeWorkerRef , volumeSelections , setVolumeSelections , displaySettings , setSidebarDisplay , setDisplaySettings }) {
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  return (
    <div id="Canvas3D" className="w-100">
      <Canvas
        frameloop="demand"
        onCreated={(state) => {
          invalidateRef = state.invalidate;
          cameraRef = state.camera;
        }}
        camera={{ fov: 75, position: [0, 1.5, 12] }}
      >
        <BackgroundManager 
          skyboxPreset={displaySettings['skyboxPreset']}
          skyboxVisible={displaySettings['skyboxVisible']}
          backgroundVisible={displaySettings['backgroundVisible']}
          backgroundColor={displaySettings['backgroundColor']}
        />
        <gridHelper visible={displaySettings["gridVisible"]} args={[10]}/>

        {Object.keys(volumeSelections).map(volumeId => (
          <VolumeSelectionBox
            key = {volumeId}
            volumeId = {volumeId}
            volumeSelections={volumeSelections} 
            setVolumeSelections={setVolumeSelections}
            setOrbitControlsEnabled={setOrbitEnabled} 
          />
        ))}

        <OrbitControls makeDefault enabled={orbitEnabled} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} />
        <OctreeTest 
          position={[0, 0, 0]} 
          rotation={[0, 0, 0]} 
          url={binaryPLYFile} 
          octreeMaxLOD={displaySettings['octreeMaxLOD']}
          setSidebarDisplay={setSidebarDisplay}
          octreeWorkerRef={octreeWorkerRef}
        />
      </Canvas>
    </div>
  );
}

export default Canvas3D;