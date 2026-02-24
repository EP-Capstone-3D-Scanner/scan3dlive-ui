import * as THREE from 'three'
import { useEffect, useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
// Vite-specific worker import
import OctreeWorker from './octree.worker.js?worker' 


function OctreeTest({ position, rotation, url, octreeMaxLOD }) {
  const { invalidate, size } = useThree()
  
  const [isLoaded, setIsLoaded] = useState(false)
  const workerRef = useRef(null)
  const geometryRef = useRef(new THREE.BufferGeometry())
  const positionAttrRef = useRef(null)
  const colorAttrRef = useRef(null)
  const transferBufferRef = useRef(null) 
  const isWorkerBusy = useRef(false)
  
  /*
  const aspectRatio = useRef(size.width / size.height)
  useEffect(() => {
    aspectRatio.current = size.width / size.height
  }, [size.width, size.height])
  */

  useEffect(() => {
    invalidate();
    const worker = new OctreeWorker()
    workerRef.current = worker

    worker.onmessage = (e) => {

      setTimeout(() => invalidate(), 10);
      const { type, payload, buffer } = e.data

      if (type === 'READY') {
        worker.postMessage({ type: 'INIT', payload: { url } })
      } 
      
      else if (type === 'INIT_DONE') {
        const { maxPoints } = payload;
        const byteSize = maxPoints * 4 * 4;

        const displayArray = new Float32Array(new ArrayBuffer(byteSize));
        const positionBuffer = new THREE.InterleavedBuffer(displayArray, 4);
        const colorBuffer = new THREE.InterleavedBuffer(new Uint8Array(displayArray.buffer), 16);
        positionAttrRef.current = new THREE.InterleavedBufferAttribute(positionBuffer, 3, 0);
        colorAttrRef.current = new THREE.InterleavedBufferAttribute(colorBuffer, 4, 12, true);
        positionAttrRef.current.data.needsUpdate = true;
        colorAttrRef.current.data.needsUpdate = true;
        geometryRef.current.setAttribute('position', positionAttrRef.current);
        geometryRef.current.setAttribute('color', colorAttrRef.current);
        transferBufferRef.current = new ArrayBuffer(byteSize);
        setIsLoaded(true);
      }

      else if (type === 'UPDATE_DONE') {
        positionAttrRef.current.data.set(new Float32Array(buffer)) 
        positionAttrRef.current.data.needsUpdate = true;
        colorAttrRef.current.data.needsUpdate = true;
        geometryRef.current.setDrawRange(0, payload.vertexCount);
        transferBufferRef.current = buffer;
        isWorkerBusy.current = false;
      }

      else if (type === 'NO_UPDATE') {
        transferBufferRef.current = buffer;
        isWorkerBusy.current = false;
      }
    }

    return () => {worker.terminate()}
  }, [url])

  useFrame((state) => {
    if (!isLoaded || isWorkerBusy.current || !transferBufferRef.current) return
    
    isWorkerBusy.current = true

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
    }

    workerRef.current.postMessage({
      type: 'UPDATE',
      payload: cameraData,
      buffer: transferBufferRef.current 
    }, [transferBufferRef.current]) 

    transferBufferRef.current = null 

  })

  return (
    <group position={position} rotation={rotation}>
      <points geometry={geometryRef.current} dispose={null} frustumCulled={false}>
        <pointsMaterial size={0.02} sizeAttenuation vertexColors={true} />
      </points>
    </group>
  )
}

export default OctreeTest;