import React from 'react';
import { useState , useEffect , useMemo , useRef} from 'react';
import { Canvas, useFrame, useLoader, useThree} from '@react-three/fiber'
import { FirstPersonControls, OrbitControls, Html } from '@react-three/drei'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import OctreeTest from './OctreeTest'
import * as Loggers from './Loggers'


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


function Canvas3D({
  annotations, 
  setAnnotations, 
  selectedModel, 
  setSelectedModel
}) {

  const binaryFile = "point_clouds/octree_bin1.bin";
  return (
    <>
    <div id="Canvas3D" class="h-100 w-100">
      <Canvas camera={{position:[0, 1.5, 12]}}>
        {/*<Loggers.CameraLogger />*/}
        {/*<Loggers.ProjectPointLogger />*/}
        {/*<Loggers.CanvasLogger />*/}
        <Loggers.BoundingBox min={[-5, -5, -5]} max={[5, 5, 5]} />
        <gridHelper args = {[20]}></gridHelper>
        <OrbitControls></OrbitControls>
        <ambientLight intensity={1} />
        <directionalLight position={[5,5,5]}/>
        <OctreeTest position={[0,1.5,12]} url={binaryFile} />
        <OctreeTest position={[-15,1.5,12]} url={binaryFile} />
        <OctreeTest position={[-30,1.5,12]} url={binaryFile} />
        <OctreeTest position={[-45,1.5,12]} url={binaryFile} />
        <OctreeTest position={[-60,1.5,12]} url={binaryFile} />
        <OctreeTest position={[-75,1.5,12]} url={binaryFile} />
        <OctreeTest position={[-90,1.5,12]} url={binaryFile} />
        <OctreeTest position={[0,1.5,12]} url={binaryFile} />
        <OctreeTest position={[15,1.5,12]} url={binaryFile} />
        <OctreeTest position={[30,1.5,12]} url={binaryFile} />
        <OctreeTest position={[45,1.5,12]} url={binaryFile} />
        <OctreeTest position={[60,1.5,12]} url={binaryFile} />
        <OctreeTest position={[75,1.5,12]} url={binaryFile} />
        <OctreeTest position={[90,1.5,12]} url={binaryFile} />
        <OctreeTest position={[0,15,12]} url={binaryFile} />
        <OctreeTest position={[-15,15,12]} url={binaryFile} />
        <OctreeTest position={[-30,15,12]} url={binaryFile} />
        <OctreeTest position={[-45,15,12]} url={binaryFile} />
        <OctreeTest position={[-60,15,12]} url={binaryFile} />
        <OctreeTest position={[-75,15,12]} url={binaryFile} />
        <OctreeTest position={[-90,15,12]} url={binaryFile} />
        <OctreeTest position={[0,15,12]} url={binaryFile} />
        <OctreeTest position={[15,15,12]} url={binaryFile} />
        <OctreeTest position={[30,15,12]} url={binaryFile} />
        <OctreeTest position={[45,15,12]} url={binaryFile} />
        <OctreeTest position={[60,15,12]} url={binaryFile} />
        <OctreeTest position={[75,15,12]} url={binaryFile} />
        <OctreeTest position={[90,15,12]} url={binaryFile} />
        <OctreeTest position={[-15,29.5,12]} url={binaryFile} />
        <OctreeTest position={[-30,29.5,12]} url={binaryFile} />
        <OctreeTest position={[-45,29.5,12]} url={binaryFile} />
        <OctreeTest position={[-60,29.5,12]} url={binaryFile} />
        <OctreeTest position={[-75,29.5,12]} url={binaryFile} />
        <OctreeTest position={[-90,29.5,12]} url={binaryFile} />
        <OctreeTest position={[0,29.5,12]} url={binaryFile} />
        <OctreeTest position={[15,29.5,12]} url={binaryFile} />
        <OctreeTest position={[30,29.5,12]} url={binaryFile} />
        <OctreeTest position={[45,29.5,12]} url={binaryFile} />
        <OctreeTest position={[60,29.5,12]} url={binaryFile} />
        <OctreeTest position={[75,29.5,12]} url={binaryFile} />
        <OctreeTest position={[90,29.5,12]} url={binaryFile} />
        {/*<Model selectedModel={selectedModel} setSelectedModel={setSelectedModel} chunk="test" position={[0,1.5,12]} annotations={annotations} setAnnotations={setAnnotations}></Model>*/}
        {Array.from(annotations.entries()).map(([id, annotation]) => (
          <Html key={id} zIndexRange={[0, 0]} position={annotation.position} transform>
            <div className="annotation bg-dark text-white rounded">{`Object ${annotation.label}`}</div>
          </Html>
        ))}
        <Html zIndexRange={[0, 0]} position={[0,0,9]} transform> 
          <div class="annotation bg-dark text-white">3D Scanning and Visualization Platform</div>
        </Html>
      </Canvas>
    </div>
    </>
  )
}

export default Canvas3D;