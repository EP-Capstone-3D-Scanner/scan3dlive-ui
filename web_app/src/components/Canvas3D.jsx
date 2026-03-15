import React from 'react';
import * as THREE from 'three'
import { useState , useEffect, useRef , Suspense } from 'react';
import { Canvas,  useThree } from '@react-three/fiber'
import { Environment , FirstPersonControls , OrbitControls} from '@react-three/drei'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import { VolumeSelectionBox } from './VolumeSelectionBox'
import OctreeTest from './OctreeTest'
import * as Loggers from './Loggers'
//position={[-0.5,1.10,8]} rotation={[-Math.PI/2, 0, Math.PI/2]}


let invalidateRef = null
let cameraRef = null
const binaryPLYFile = "/point_clouds/UFO_2735.ply"

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

function Canvas3D({ websocketRef , octreeWorkerRef , volumeSelections , setVolumeSelections , deletionSelection, setDeletionSelection, displaySettings , sidebarDisplay, setSidebarDisplay , isWorkerBusy , setDisplaySettings }) {
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  return (
    <div id="Canvas3D" className="w-100">
      <Canvas
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
            isDeletion={false}
            volumeId = {volumeId}
            volumeSelections={volumeSelections} 
            setVolumeSelections={setVolumeSelections}
            setOrbitControlsEnabled={setOrbitEnabled} 
            showLabel={displaySettings['showLabels']}
            focusColor="#ffcc00" 
            color="#0088ff"
          />
        ))}

        {(sidebarDisplay['page'] == 'DeletionSelectionMenu') && sidebarDisplay['show'] ? 
          <VolumeSelectionBox
            isDeletion={true}
            deletionSelection={deletionSelection}
            setDeletionSelection={setDeletionSelection}
            setOrbitControlsEnabled={setOrbitEnabled} 
            focusColor="#ff0000" 
            color="#fd0000"
          /> : null
        }

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
          websocketRef={websocketRef}
          scannerReconnecting={sidebarDisplay['scannerReconnecting']}
          isWorkerBusy={isWorkerBusy}
        />
      </Canvas>
    </div>
  );
}

export default Canvas3D;