import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Html, Edges } from '@react-three/drei';
import * as THREE from 'three';

export const VolumeSelectionBox = ({ 
  volumeId,
  volumeSelections,
  setVolumeSelections,
  setOrbitControlsEnabled,
  color,
  deletionSelection,
  setDeletionSelection,
  focusColor,
  isDeletion,
  showLabel
}) => {
  const { camera, raycaster } = useThree();
  const meshRef = useRef();
  const labelRef = useRef();

  const currentData = isDeletion ? deletionSelection : volumeSelections[volumeId];
  const position = useMemo(() => new THREE.Vector3(...currentData.position), [currentData.position]);
  const size = useMemo(() => new THREE.Vector3(...currentData.size), [currentData.size]);
  const rotation = useMemo(() => new THREE.Euler(...(currentData.rotation || [0, 0, 0]), 'XYZ'), [currentData.rotation]);

  const [isDragging, setIsDragging] = useState(false);
  const [isTPressed, setIsTPressed] = useState(false);
  const [isRPressed, setIsRPressed] = useState(false);
  const dragInfo = useRef(null);

  useLayoutEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(1, 1, 1);
    }
    if (labelRef.current) {
      labelRef.current.position.set(position.x, position.y, position.z);
    }
  }, [position, size]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 't') setIsTPressed(true);
      if (e.key.toLowerCase() === 'r') setIsRPressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === 't') setIsTPressed(false);
      if (e.key.toLowerCase() === 'r') setIsRPressed(false);
    };
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
    
    // Grab camera up/right vectors to perfectly map 2D mouse drag to our 3D rotation angle
    const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    let mode = "resize";
    if (isRPressed) mode = "rotate";
    else if (isTPressed) mode = "translate";

    dragInfo.current = {
      startPoint: e.point.clone(),
      startPosition: position.clone(),
      startSize: size.clone(),
      startQuaternion: meshRef.current.quaternion.clone(), 
      localAxis: e.face.normal.clone(), // The face clicked dictates the locked rotation axis
      camUp,
      camRight,
      faceNormal: e.face.normal.clone(),
      dragPlane,
      mode,
    };
  };

  const onPointerMove = (e) => {
    if (!isDragging || !dragInfo.current) return;
    e.stopPropagation();

    const { startPoint, startPosition, startSize, startQuaternion, localAxis, faceNormal, dragPlane, camUp, camRight, mode } = dragInfo.current;
    
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane, intersection);
    if (!intersection) return;

    // delta is currently in WORLD space
    const delta = intersection.clone().sub(startPoint);

    if (mode === "rotate") {
      const sensitivity = 0.5; 
      
      const screenDragX = delta.dot(camRight);
      const screenDragY = delta.dot(camUp);
      const angle = (screenDragX + screenDragY) * sensitivity;
      
      const newQuat = startQuaternion.clone();
      const rotQuat = new THREE.Quaternion().setFromAxisAngle(localAxis, angle);
      
      newQuat.multiply(rotQuat);
      meshRef.current.quaternion.copy(newQuat);

    } else if (mode === "translate") {
      const newPos = startPosition.clone().add(delta);
      meshRef.current.position.set(newPos.x, newPos.y, newPos.z);
      if(labelRef.current) {
        labelRef.current.position.set(newPos.x, newPos.y, newPos.z);
      }

    } else {
      // RESIZE LOGIC FIX:
      // Convert world delta into the object's local space to correctly map against local face normals
      const localDelta = delta.clone().applyQuaternion(startQuaternion.clone().invert());
      
      // Calculate movement along the local normal using the local delta
      const deltaAlongNormal = localDelta.dot(faceNormal);
      const axis = faceNormal.x !== 0 ? "x" : faceNormal.y !== 0 ? "y" : "z";
      
      const newSizeVal = Math.max(0.1, startSize[axis] + deltaAlongNormal);
      const appliedDelta = newSizeVal - startSize[axis];
      
      const newSize = startSize.clone();
      newSize[axis] = newSizeVal;

      const positionOffset = faceNormal.clone().multiplyScalar(appliedDelta / 2);
      // Ensure we rotate the local face normal into world space using the quaternion for the position update
      positionOffset.applyQuaternion(startQuaternion); 
      const newPos = startPosition.clone().add(positionOffset);
      
      meshRef.current.position.set(newPos.x, newPos.y, newPos.z);
      meshRef.current.scale.set(newSize.x / startSize.x, newSize.y / startSize.y, newSize.z / startSize.z);
      
      if(labelRef.current) {
        labelRef.current.position.set(newPos.x, newPos.y, newPos.z);
      }
    }
  };

  const onPointerUp = (e) => {
    e.stopPropagation();
    if (e.pointerId !== undefined) e.target.releasePointerCapture(e.pointerId);

    const finalPos = meshRef.current.position.clone();
    // Convert the quaternion back to Euler angles for your state management
    const finalRot = new THREE.Euler().setFromQuaternion(meshRef.current.quaternion, 'XYZ');
    const finalSize = dragInfo.current ? 
        dragInfo.current.startSize.clone().multiply(meshRef.current.scale) : size.clone();

    if (isDeletion) {
      setDeletionSelection(prev => ({
        ...prev,
          position: [finalPos.x, finalPos.y, finalPos.z], 
          size: [Math.abs(finalSize.x), Math.abs(finalSize.y), Math.abs(finalSize.z)],
          rotation: [finalRot.x, finalRot.y, finalRot.z]
      }));
    }
    else {
      setVolumeSelections(prev => ({
        ...prev,
        [volumeId]: { 
          ...prev[volumeId], 
          position: [finalPos.x, finalPos.y, finalPos.z], 
          size: [Math.abs(finalSize.x), Math.abs(finalSize.y), Math.abs(finalSize.z)],
          rotation: [finalRot.x, finalRot.y, finalRot.z]
        }
      }));
    }
    
    setIsDragging(false);
    setOrbitControlsEnabled(true);
    dragInfo.current = null;
  };

  return (
    <group>
      <group ref={labelRef}>
        <Html distanceFactor={10} transform sprite center> 
          <div className="annotation bg-dark text-white px-2 py-1 rounded shadow-sm" 
               style={{ display: (isDeletion||!showLabel)? 'none':'block', fontSize: '14px', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            {currentData.name}
          </div>
        </Html>
      </group>

      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <boxGeometry args={[size.x, size.y, size.z]} />
        <meshStandardMaterial 
          color={isDragging ? focusColor : color} 
          transparent 
          opacity={0.3} 
          depthWrite={false}
        />
        <Edges scale={1} threshold={15} color={isDragging ? "orange" : "white"} />
      </mesh>
    </group>
  );
};