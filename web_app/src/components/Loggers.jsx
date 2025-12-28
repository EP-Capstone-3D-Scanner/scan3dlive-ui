import React from 'react';
import * as THREE from 'three';
import { useEffect , useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber'

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

export function CameraLogger() {
  const { camera } = useThree();
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  useEffect(() => {
    console.log('Camera object:', camera);
    //console.log('Camera position:', camera.position);
    //console.log('Camera rotation:', camera.rotation);
  }, [camera]);

  return null;
}

export function CanvasLogger() {
  const { gl } = useThree();

  useFrame(() => {
    // Actual framebuffer resolution
    console.log('Canvas width (pixels):', gl.domElement.width);
    console.log('Canvas height (pixels):', gl.domElement.height);

    // Display size in CSS pixels
    console.log('Canvas clientWidth (CSS px):', gl.domElement.clientWidth);
    console.log('Canvas clientHeight (CSS px):', gl.domElement.clientHeight);
  });

  return null;
}

export function ProjectPointLogger() {
  const { camera, gl } = useThree();
  const accumulator = useRef(0); // tracks elapsed time
  const worldPoint = React.useMemo(() => new THREE.Vector3(2, 1, 1), []);

  useFrame((state, delta) => {
    // Accumulate time
    accumulator.current += delta;

    const interval = 0.5; // seconds → logs at ~5fps
    if (accumulator.current < interval) return;

    // Reset accumulator
    accumulator.current = 0;

    // Ensure camera matrices are fully updated
    camera.updateWorldMatrix(true, false);
    camera.updateProjectionMatrix();

    // --- Original console.log statements preserved ---
    console.log(camera);  

    // World → View space
    const viewSpace = worldPoint.clone().applyMatrix4(camera.matrixWorldInverse);

    // View → Clip space
    const clipSpace = new THREE.Vector4(viewSpace.x, viewSpace.y, viewSpace.z, 1);
    console.log('Clip (before projectionMatrix):', clipSpace.toArray());

    clipSpace.applyMatrix4(camera.projectionMatrix);
    console.log(camera.projectionMatrix);

    const ndc2 = new THREE.Vector3(
      clipSpace.x / clipSpace.w,
      clipSpace.y / clipSpace.w,
      clipSpace.z / clipSpace.w
    );
    console.log('View (after matrixWorldInverse):', viewSpace.toArray());
    console.log('Clip (after projectionMatrix):', clipSpace.toArray());
    console.log('NDC2:', ndc2.toArray());

    const ndc = worldPoint.clone().project(camera);
    console.log('NDC:', ndc.x, ndc.y, ndc.z);

    const screenX = (ndc.x + 1) * 0.5 * gl.domElement.clientWidth;
    const screenY = (1 - ndc.y) * 0.5 * gl.domElement.clientHeight;

    console.log('World:', worldPoint.toArray());
    console.log('Screen (px):', screenX, screenY);
  });

  return null;
}