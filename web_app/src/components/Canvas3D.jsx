import React from 'react';
import { Canvas, useFrame, useLoader} from '@react-three/fiber'
import { useRef } from 'react'
import { FirstPersonControls, OrbitControls, PointMaterial } from '@react-three/drei'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'


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
  
  function Model({position}) {
    const geometry = useLoader(PLYLoader, 'point_clouds/test1.ply');
    return (
      <points rotation={[-Math.PI/2, 0, Math.PI/2]}  position={position} geometry={geometry} scale={2}>
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
    return (
        <>
        <div id="Canvas3D" class="h-100 w-100">
          <Canvas camera={{position:[2,2,3]}}>
            <gridHelper args = {[20]}></gridHelper>
            <OrbitControls></OrbitControls>
            <AnimatedBox></AnimatedBox>
            <ambientLight intensity={1} />
            <directionalLight position={[5,5,5]}/>
            <Model position={[0,0,0]}></Model>
          </Canvas>
        </div>
        </>
    )
}

export default Canvas3D;