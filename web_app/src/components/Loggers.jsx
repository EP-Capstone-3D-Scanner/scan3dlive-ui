import React from 'react';
import * as THREE from 'three';
import { useState , useEffect , useRef } from 'react';
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
/*<Loggers.BoundingBox min={[-5, -5, -5]} max={[5, 5, 5]} />*/

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

export const BoundingBox = ({ min = [-5, -5, -5], max = [5, 5, 5] }) => {
  const meshRef = useRef(0);
  const { camera, gl , size} = useThree();
  const rect = gl.domElement.getBoundingClientRect();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Generate all 8 corners of the bounding box
  const corners = [
    [min[0], min[1], min[2]],
    [min[0], min[1], max[2]],
    [min[0], max[1], min[2]],
    [min[0], max[1], max[2]],
    [max[0], min[1], min[2]],
    [max[0], min[1], max[2]],
    [max[0], max[1], min[2]],
    [max[0], max[1], max[2]],
  ].map((c) => new THREE.Vector3(...c));

  // Helper: Project 3D point to 2D screen coordinates
  const projectToScreen = (vec3) => {
    const vec = vec3.clone();
    vec.project(camera);
    return {
      x: ((vec.x + 1) / 2) * size.width,
      y: ((-vec.y + 1) / 2) * size.height,
    };
  };

  useEffect(() => {
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    const handleMouseMove = (event) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    
    meshRef.current += 1;
    if(meshRef.current % 300) {
      return;
    }

    // Display size in CSS pixels
    console.log('Canvas clientWidth (CSS px):', size.width);
    console.log('Canvas clientHeight (CSS px):', size.height);
    console.log(size)
    
    // Log mouse position
    console.log("Mouse Position (pixels):", mousePos);

    // Log camera params
    console.log("Camera:");
    console.log(camera);
    
    // Log corners in 3D
    console.log("3D Corners:");
    //corners.forEach((c, i) => console.log(`Corner ${i}:`, c.toArray()));

    // Log corners projected to 2D screen
    console.log("2D Screen Coordinates:");
    corners.forEach((c, i) => console.log(`Corner ${i}:`, projectToScreen(c)));

    // --- NEW: Calculate projected area ---
    const projected = corners.map(projectToScreen);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    projected.forEach(({ x, y }) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    const normWidth = maxX - minX;
    const normHeight = maxY - minY;
    const normalizedArea = normWidth * normHeight;

    console.log("Projected 2D Area (normalized):", normalizedArea);
    console.log("Screen bounds:", { minX, maxX, minY, maxY });
  });

  return (
    <>
      {/* Draw box as a line geometry */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...max.map((v, i) => v - min[i]))]} />
        <lineBasicMaterial color="red" />
      </lineSegments>

      {/* Draw small spheres at each corner */}
      {corners.map((corner, i) => (
        <mesh key={i} position={corner}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="blue" />
        </mesh>
      ))}

      {/* Display corner positions as text using <Html> if you want */}
    </>
  );
};