import * as THREE from 'three'
import { useEffect, useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import useWebSocketClient from './Websocket';
import OctreeWorker from './octree.worker.js?worker' 



function OctreeTest({ octreeWorkerRef , position , rotation , url , octreeMaxLOD , setSidebarDisplay }) {
  const { invalidate } = useThree()
  const [isLoaded, setIsLoaded] = useState(false)
  const geometryRef = useRef(new THREE.BufferGeometry())
  const positionAttrRef = useRef(null)
  const colorAttrRef = useRef(null)
  const isWorkerBusy = useRef(true)
  const pointsInsertedRef = useRef(false);
  
  //useWebSocketClient({url: "wss://localhost:8001", workerRef : workerRef, pointsInsertedRef:pointsInsertedRef, isWorkerBusy:isWorkerBusy, setSidebarDisplay: setSidebarDisplay});

  useEffect(() => {
    invalidate();
      octreeWorkerRef.current = new OctreeWorker()
      octreeWorkerRef.current.onmessage = (e) => {
      setTimeout(() => invalidate(), 10);
      const { type, payload } = e.data; // Removed 'buffer'

      if (type === 'READY') {
        octreeWorkerRef.current.postMessage({ type: 'INIT', payload: { url } })
      } 
      
      else if (type === 'INIT_DONE') {
        const { sharedBuffer } = payload;
        const positionBuffer = new THREE.InterleavedBuffer(new Float32Array(sharedBuffer), 4);
        const colorBuffer = new THREE.InterleavedBuffer(new Uint8Array(sharedBuffer), 16);
        positionAttrRef.current = new THREE.InterleavedBufferAttribute(positionBuffer, 3, 0);
        colorAttrRef.current = new THREE.InterleavedBufferAttribute(colorBuffer, 4, 12, true);
        console.log('done')
        isWorkerBusy.current = false;
        setIsLoaded(true);
      }

      else if (type === 'LOAD_DONE') {
        console.log('loading done')
        console.log(positionAttrRef.current)
        console.log(colorAttrRef.current)
        if(pointsInsertedRef.current == false) {
          geometryRef.current.setAttribute('position', positionAttrRef.current);
          geometryRef.current.setAttribute('color', colorAttrRef.current);    
          geometryRef.current.setDrawRange(0, 3);
          positionAttrRef.current.data.needsUpdate = true;
          colorAttrRef.current.data.needsUpdate = true; 
          pointsInsertedRef.current = true;
        }
        positionAttrRef.current.data.needsUpdate = true;
        colorAttrRef.current.data.needsUpdate = true;
        isWorkerBusy.current = false;  
      }

      else if (type == 'INSERT_DONE') {
        positionAttrRef.current.data.needsUpdate = true;
        colorAttrRef.current.data.needsUpdate = true;
        isWorkerBusy.current = false; 
      }

      else if (type === 'UPDATE_DONE') {
        positionAttrRef.current.data.needsUpdate = true;
        colorAttrRef.current.data.needsUpdate = true;        
        geometryRef.current.setDrawRange(0, payload.vertexCount);
        isWorkerBusy.current = false;
      }

      else if (type === 'NO_UPDATE') {
        isWorkerBusy.current = false;
      }
    }
    return () => {octreeWorkerRef.current.terminate()}
  }, [url])


  useFrame((state) => {
    //console.log("isLoaded" + isLoaded)
    //console.log(isWorkerBusy.current)
    if (!isLoaded || isWorkerBusy.current) return;
    isWorkerBusy.current = true;
    
    const cameraData = {
      pos: { 
        x: state.camera.position.x, 
        y: state.camera.position.y, 
        z: state.camera.position.z 
      },
      vmi: [...state.camera.matrixWorldInverse.elements],
      pm: [...state.camera.projectionMatrix.elements],
      aspectRatio: state.camera.aspect,
      maxLOD: octreeMaxLOD
    };
    
    // 4. No need to pass a buffer back, just send the camera data
    octreeWorkerRef.current.postMessage({
      type: 'UPDATE',
      payload: cameraData
    });
  });

  return (
    <group position={position} rotation={rotation}>
      <points geometry={geometryRef.current} dispose={null} frustumCulled={false}>
        <pointsMaterial size={0.03} sizeAttenuation vertexColors={true} />
      </points>
    </group>
  )
}

export default OctreeTest;