import React from 'react';
import * as THREE from 'three'
import { useState , useEffect , useMemo , useRef} from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { Environment , OrbitControls, Html } from '@react-three/drei'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import OctreeTest from './OctreeTest'
import * as Loggers from './Loggers'
//position={[-0.5,1.10,8]} rotation={[-Math.PI/2, 0, Math.PI/2]
function Model({
  chunk, 
  position, 
  annotations, 
  setAnnotations, 
  selectedModel, 
  setSelectedModel
}) {
  const geometry = useLoader(PLYLoader, 'point_clouds/test1.ply');

  const handlePointsClick = (e) => {
    e.stopPropagation();     // keep event from hitting other objects
    setSelectedModel(chunk)
    console.log(selectedModel)
    if(e.shiftKey) {
      const id = annotations.size ? Math.max(...annotations.keys()) + 1 : 1;
      setAnnotations(prev=> new Map(prev).set(id, {"Model": chunk, "label":id, "position": e.point}))
      console.log({"Model": chunk, "label":id, "position": e.point})
    }
  }
  
  return (
    <points onClick={handlePointsClick} rotation={[-Math.PI/2, 0, Math.PI/2]}  position={position} geometry={geometry} scale={2}>
      <pointsMaterial
        sizeAttenuation={true}
        size={0.00001}          // size of each point
        vertexColors         // if your PLY has colors
        color="white"        // fallback color
      />
    </points>
  );
}

let invalidateRef = null
let cameraRef = null

export function invalidateCanvas() {
  console.log('invalidated')
  invalidateRef?.()
}

export function getCamera() {
  return cameraRef
}


// Need to combine these components into a single "Background Manager". Also clean up code
function Skybox({ visible, preset }) {

  useEffect(() => {
    if (!visible) return;
    // When mounted, optionally invalidate
    invalidateCanvas();
    // Cleanup runs when unmounted
    return () => {
      invalidateCanvas(); // force redraw when removed
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <Environment
      key={preset} // ensures re-mount on preset change
      preset={preset}
      background
      onLoad={() => invalidateCanvas()}
    />
  );
}

const SceneUpdater = ({ displaySettings }) => {
  const { scene } = useThree();

  useEffect(() => {
    if(!displaySettings['skyboxVisible']) {
      scene.background = null;
    }
    if(displaySettings['backgroundVisible'] && !displaySettings['skyboxVisible']) {
      scene.background = new THREE.Color(displaySettings['backgroundColor']);
    }
    invalidateCanvas()
  }, [displaySettings['backgroundColor'], displaySettings['backgroundVisible'], displaySettings['skyboxVisible']]); 

  return null; 
};


function Canvas3D({
  annotations,
  setAnnotations,
  selectedModel,
  setSelectedModel,
  displaySettings,
  setDisplaySettings,
}) {
  const binaryFile = "point_clouds/octree_bin10.bin";

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
        <SceneUpdater 
          displaySettings={displaySettings} 
        />
        <Skybox
          visible={displaySettings["skyboxVisible"]}
          preset={displaySettings["skyboxPreset"]}
        />
        <gridHelper 
          visible={displaySettings["gridVisible"]} 
          args={[10]} 
        />
        <OrbitControls />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} />
        <OctreeTest 
          position={[0, 0, 0]} 
          rotation={[0, 0, 0]} 
          url={binaryFile} 
          displaySettings={displaySettings}
        />
      </Canvas>
    </div>
  );
}

export default Canvas3D;

/*
{Array.from(annotations.entries()).map(([id, annotation]) => (
<Html key={id} zIndexRange={[0, 0]} position={annotation.position} transform>
<div className="annotation bg-dark text-white rounded">{`Object ${annotation.label}`}
</div>
</Html>))}

<Html zIndexRange={[0, 0]} position={[0,0,9]} transform> 
<div className="annotation bg-dark text-white">3D Scanning and Visualization Platform</div>
</Html>*/