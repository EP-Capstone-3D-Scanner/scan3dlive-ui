import React, { useRef, useState, useEffect, useMemo , useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Edges, Html } from "@react-three/drei";
import * as THREE from "three";

export const VolumeSelectionBox = ({ 
  volumeId,
  volumeSelections,
  setVolumeSelections,
  setOrbitControlsEnabled 
}) => {
  const { camera, raycaster } = useThree();
  const meshRef = useRef();
  const labelRef = useRef(); // New ref for the label container

  const currentData = volumeSelections[volumeId];
  const position = useMemo(() => new THREE.Vector3(...currentData.position), [currentData.position]);
  const size = useMemo(() => new THREE.Vector3(...currentData.size), [currentData.size]);

  const [isDragging, setIsDragging] = useState(false);
  const [isTPressed, setIsTPressed] = useState(false);
  const dragInfo = useRef(null);

  // Sync scale and label position immediately after React re-renders from state
  useLayoutEffect(() => {
    if (meshRef.current && labelRef.current) {
      meshRef.current.scale.set(1, 1, 1);
      labelRef.current.position.set(position.x, position.y, position.z);
    }
  }, [position, size]);

  useEffect(() => {
    const handleKeyDown = (e) => e.key.toLowerCase() === 't' && setIsTPressed(true);
    const handleKeyUp = (e) => e.key.toLowerCase() === 't' && setIsTPressed(false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const onPointerDown = (e) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setOrbitControlsEnabled(false);
    setIsDragging(true);

    const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
    const dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(cameraDirection, e.point);
    
    dragInfo.current = {
      startPoint: e.point.clone(),
      startPosition: position.clone(),
      startSize: size.clone(),
      faceNormal: e.face.normal.clone(),
      dragPlane,
      mode: isTPressed ? "translate" : "resize",
    };
  };

  const onPointerMove = (e) => {
    if (!isDragging || !dragInfo.current) return;
    e.stopPropagation();

    const { startPoint, startPosition, startSize, faceNormal, dragPlane, mode } = dragInfo.current;
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane, intersection);
    if (!intersection) return;

    const delta = intersection.clone().sub(startPoint);

    if (mode === "translate") {
      const newPos = startPosition.clone().add(delta);
      
      // Update Mesh
      meshRef.current.position.set(newPos.x, newPos.y, newPos.z);
      // Update Label (Moves with translate)
      labelRef.current.position.set(newPos.x, newPos.y, newPos.z);

    } else {
      // Resize Logic
      const deltaAlongNormal = delta.dot(faceNormal);
      const axis = faceNormal.x !== 0 ? "x" : faceNormal.y !== 0 ? "y" : "z";
      
      const newSizeVal = Math.max(0.1, startSize[axis] + deltaAlongNormal);
      const appliedDelta = newSizeVal - startSize[axis];
      
      const newSize = startSize.clone();
      newSize[axis] = newSizeVal;

      const positionOffset = faceNormal.clone().multiplyScalar(appliedDelta / 2);
      const newPos = startPosition.clone().add(positionOffset);
      
      // Update Mesh Scale & Position
      meshRef.current.position.set(newPos.x, newPos.y, newPos.z);
      meshRef.current.scale.set(newSize.x / startSize.x, newSize.y / startSize.y, newSize.z / startSize.z);
      
      // Update Label (Stays at the TOP of the resized box)
      // Note: we use newSize.y here so it floats above the new height
      labelRef.current.position.set(newPos.x, newPos.y, newPos.z);
    }
  };

  const onPointerUp = (e) => {
    e.stopPropagation();
    if (e.pointerId !== undefined) e.target.releasePointerCapture(e.pointerId);

    const finalPos = meshRef.current.position.clone();
    const box = new THREE.Box3().setFromObject(meshRef.current);
    const finalSize = new THREE.Vector3();
    box.getSize(finalSize); 

    setVolumeSelections(prev => ({
      ...prev,
      [volumeId]: { 
        ...prev[volumeId], 
        position: [finalPos.x, finalPos.y, finalPos.z], 
        size: [finalSize.x, finalSize.y, finalSize.z] 
      }
    }));
    
    setIsDragging(false);
    setOrbitControlsEnabled(true);
    dragInfo.current = null;
  };

  return (
    <group>
      {/* The Label is now a sibling to the mesh. 
        It has its own group with a ref so we can move it without scaling it.
      */}
      <group ref={labelRef}>
        <Html distanceFactor={10} transform sprite center> 
          <div className="annotation bg-dark text-white px-2 py-1 rounded shadow-sm" 
               style={{ fontSize: '14px', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            {currentData.name}
          </div>
        </Html>
      </group>

      <mesh
        ref={meshRef}
        position={position}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <boxGeometry args={[size.x, size.y, size.z]} />
        <meshStandardMaterial 
          color={isDragging ? "#ffcc00" : "#0088ff"} 
          transparent 
          opacity={0.3} 
          depthWrite={false}
        />
        <Edges scale={1} threshold={15} color={isDragging ? "orange" : "white"} />
      </mesh>
    </group>
  );
};
function WireframeCube() {
  return (
    <>
    <Html zIndexRange={[0, 0]} position={[0,0,9]} transform> 
      <div className="annotation bg-dark text-white">3D Scanning and Visualization Platform</div>
    </Html>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <Edges
          color="white"
          threshold={15}
        />
        <meshBasicMaterial color="blue" transparent opacity={0.1} />
      </mesh>
    </>
  );
}