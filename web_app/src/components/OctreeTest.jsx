import * as THREE from 'three'
import { useEffect, useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
// Vite-specific worker import
import OctreeWorker from './octree.worker.js?worker' 

function OctreeTest({ position, rotation, url, displaySettings }) {
  const { invalidate, size } = useThree()
  
  const [isLoaded, setIsLoaded] = useState(false)
  const workerRef = useRef(null)
  const geometryRef = useRef(new THREE.BufferGeometry())
  const positionAttrRef = useRef(null)
  
  // High-performance shared memory
  const transferBufferRef = useRef(null) 
  const isWorkerBusy = useRef(false)
  const aspectRatio = useRef(size.width / size.height)

  useEffect(() => {
    aspectRatio.current = size.width / size.height
  }, [size.width, size.height])

  useEffect(() => {
    // Instantiate the worker using the Vite constructor
    const worker = new OctreeWorker()
    workerRef.current = worker

    worker.onmessage = (e) => {
      const { type, payload, buffer } = e.data

      if (type === 'READY') {
        worker.postMessage({ type: 'INIT', payload: { url } })
      } 
      
      else if (type === 'INIT_DONE') {
        const { maxPoints } = payload
        // 3 floats (x,y,z) * 4 bytes per float
        transferBufferRef.current = new ArrayBuffer(maxPoints * 3 * 4)
        
        const initialArray = new Float32Array(maxPoints * 3)
        positionAttrRef.current = new THREE.BufferAttribute(initialArray, 3)
        geometryRef.current.setAttribute('position', positionAttrRef.current)
        geometryRef.current.computeBoundingSphere();
        setIsLoaded(true)
        console.log('ran')
        invalidate()
      }
      
      else if (type === 'UPDATE_DONE') {
        // Ownership of 'buffer' is now back in the Main Thread
        const view = new Float32Array(buffer)
        positionAttrRef.current.array.set(view)
        positionAttrRef.current.needsUpdate = true
        geometryRef.current.setDrawRange(0, payload.vertexCount)
        geometryRef.current.computeBoundingSphere();
        transferBufferRef.current = buffer // Store for next frame
        isWorkerBusy.current = false
        invalidate()
      }
      
      else if (type === 'NO_UPDATE') {
        transferBufferRef.current = buffer
        isWorkerBusy.current = false
      }
    }

    return () => worker.terminate()
  }, [url])

  useFrame((state) => {
    invalidate()
    if (!isLoaded || isWorkerBusy.current || !transferBufferRef.current) return

    isWorkerBusy.current = true
    
    // Capture camera data (must be clones or simple objects, not class instances)
    const cameraData = {
      pos: { x: state.camera.position.x, y: state.camera.position.y, z: state.camera.position.z },
      vmi: [...state.camera.matrixWorldInverse.elements],
      pm: [...state.camera.projectionMatrix.elements],
      aspectRatio: aspectRatio.current,
      maxLOD: displaySettings['octreeMaxLOD']
    }

    // Pass ownership of the buffer to the worker
    workerRef.current.postMessage({
      type: 'UPDATE',
      payload: cameraData,
      buffer: transferBufferRef.current 
    }, [transferBufferRef.current]) 
    
    // Main thread no longer owns this memory
    transferBufferRef.current = null 
  })

  return (
    <group position={position} rotation={rotation}>
      <points geometry={geometryRef.current}>
        <pointsMaterial size={0.02} sizeAttenuation color="black" />
      </points>
    </group>
  )
}

export default OctreeTest;