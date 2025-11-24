import React from 'react';
import { useState } from 'react';
import { Canvas, useFrame, useLoader} from '@react-three/fiber'
import { useRef } from 'react'
import { FirstPersonControls, OrbitControls, Html } from '@react-three/drei'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'

/*
function AnimatedBox() {
    const boxRef = useRef();

    useFrame(()=>{
      boxRef.current.rotation.x+=0.01;
      boxRef.current.rotation.y+=0.01;
      boxRef.current.rotation.z+=0.01;
    })
  
    return (
      <mesh ref={boxRef} position={[0, 0 , 0]}>
        <torusKnotGeometry args={[1.7, 0.3, 256, 256]}></torusKnotGeometry>
        <meshToonMaterial color={0x00bfff}></meshToonMaterial>
      </mesh>
    )
  }
  <AnimatedBox></AnimatedBox>
*/

function Model({position, annotations, setAnnotations}) {
  const geometry = useLoader(PLYLoader, 'point_clouds/test1.ply');
  
  return (
    <points onClick={(e) => {
      if(e.shiftKey) {
        e.stopPropagation();     // keep event from hitting other objects
        setAnnotations(prev=>[...prev, e.point])
        console.log("clicked point index:", e.index);
        console.log("clicked point position:", e.point);
      }
    }} rotation={[-Math.PI/2, 0, Math.PI/2]}  position={position} geometry={geometry} scale={2}>
      <pointsMaterial
        sizeAttenuation={true}
        size={0.00001}          // size of each point
        vertexColors         // if your PLY has colors
        color="white"        // fallback color
      />
    </points>
  );
}


function Canvas3D(props) {
  const [annotations, setAnnotations] = useState([]);
  return (
    <>
    <div id="Canvas3D" class="h-100 w-100">
      <Canvas camera={{position:[2,2,3]}}>
        <gridHelper args = {[20]}></gridHelper>
        <OrbitControls></OrbitControls>
        <ambientLight intensity={1} />
        <directionalLight position={[5,5,5]}/>
        <Model position={[0,0,0]} annotations={annotations} setAnnotations={setAnnotations}></Model>
        {annotations.map((item, index) => (
          <Html position={item} key={index} transform>
            <div class="annotation bg-dark text-white">Object {index + 1}</div>
          </Html>
        ))}
        
        <Html position={[0, 0, -2]} transform> 
          <div class="annotation bg-dark text-white">this text will rotate with the scene</div>
        </Html>
      </Canvas>
    </div>
    </>
  )
}

export default Canvas3D;