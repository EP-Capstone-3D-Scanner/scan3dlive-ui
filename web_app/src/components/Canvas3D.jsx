import React from 'react';
import * as THREE from 'three'
import { useState , useEffect, Suspense } from 'react';
import { Canvas,  useThree } from '@react-three/fiber'
import { Environment , FirstPersonControls, OrbitControls, Html } from '@react-three/drei'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import OctreeTest from './OctreeTest'
import * as Loggers from './Loggers'
//position={[-0.5,1.10,8]} rotation={[-Math.PI/2, 0, Math.PI/2]}


let invalidateRef = null
let cameraRef = null

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

const binaryPLYFile = "/point_clouds/oak_5M.ply"



function Canvas3D({annotations, setAnnotations, displaySettings, setDisplaySettings }) {
  return (
    <div id="Canvas3D" className="w-100">
      <Canvas
        frameloop="demand"
        onCreated={(state) => {
          invalidateRef = state.invalidate;
          cameraRef = state.camera;
        }}
        camera={{ fov: 75, near: 0.0001, far: 1000, position: [0, 1.5, 12] }}
      >
        <BackgroundManager 
          skyboxPreset={displaySettings['skyboxPreset']}
          skyboxVisible={displaySettings['skyboxVisible']}
          backgroundVisible={displaySettings['backgroundVisible']}
          backgroundColor={displaySettings['backgroundColor']}
        />

        <gridHelper 
          visible={displaySettings["gridVisible"]} 
          args={[10]} 
        />
        <OrbitControls></OrbitControls>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} />
        <OctreeTest 
          position={[0, 0, 0]} 
          rotation={[0, 0, 0]} 
          url={binaryPLYFile} 
          octreeMaxLOD={displaySettings['octreeMaxLOD']}
        />
      </Canvas>
    </div>
  );
}

export default Canvas3D;


{/** 
<FirstPersonControls
movementSpeed={5} 
noFly={false}
lookSpeed={0.05}   
lookVertical={true}
/>*/}

{/*<OctreeTest 
  position={[0, 0, 0]} 
  rotation={[0, 0, 0]} 
  url={binaryFile} 
  displaySettings={displaySettings}
/>*/}

/*
{Array.from(annotations.entries()).map(([id, annotation]) => (
<Html key={id} zIndexRange={[0, 0]} position={annotation.position} transform>
<div className="annotation bg-dark text-white rounded">{`Object ${annotation.label}`}
</div>
</Html>))}

<Html zIndexRange={[0, 0]} position={[0,0,9]} transform> 
<div className="annotation bg-dark text-white">3D Scanning and Visualization Platform</div>
</Html>*/