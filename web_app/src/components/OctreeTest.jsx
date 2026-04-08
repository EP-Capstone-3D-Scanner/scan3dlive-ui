import * as THREE from 'three'
import OctreeWorker from './octree.worker.js?worker' 
import { AppContext } from './Contexts/Contexts';
import { useThrottledFrame } from './Hooks/ThrottledFrame'
import { useEffect, useState, useRef , useContext } from 'react'
import { useThree } from '@react-three/fiber'



function OctreeTest({ position , rotation }) {
  
  const { 
    websocketRef, 
    octreeWorkerRef, 
    displaySettings, 
    isWorkerBusy
  } = useContext(AppContext)

  const { invalidate } = useThree()
  const [isLoaded, setIsLoaded] = useState(false)
  const geometryRef = useRef(new THREE.BufferGeometry())
  const positionAttrRef = useRef(null)
  const colorAttrRef = useRef(null)
  const sharedUint8ViewRef = useRef(null);
  const pointsInsertedRef = useRef(false);

  useEffect(() => {
    console.log('effect ran')
    invalidate();
    octreeWorkerRef.current = new OctreeWorker()
      
    octreeWorkerRef.current.onmessage = (e) => {
      const { type, payload , fileName } = e.data;

      if (type === 'READY') {
        octreeWorkerRef.current.postMessage({ type: 'INIT', payload: {} })
      } 
      
      else if (type === 'INIT_DONE') {
        const { sharedBuffer } = payload;
        sharedUint8ViewRef.current = new Uint8Array(sharedBuffer);
        const positionBuffer = new THREE.InterleavedBuffer(new Float32Array(sharedBuffer), 4);
        const colorBuffer = new THREE.InterleavedBuffer(new Uint8Array(sharedBuffer), 16);
        positionAttrRef.current = new THREE.InterleavedBufferAttribute(positionBuffer, 3, 0);
        colorAttrRef.current = new THREE.InterleavedBufferAttribute(colorBuffer, 4, 12, true);      
        console.log('done')
        isWorkerBusy.current = false;
      }

      else if (type === 'LOAD_DONE') {
        console.log('loading done')
        if(pointsInsertedRef.current == false) {
          geometryRef.current.setAttribute('position', positionAttrRef.current);
          geometryRef.current.setAttribute('color', colorAttrRef.current);
          positionAttrRef.current.data.setUsage(THREE.DynamicDrawUsage);
          colorAttrRef.current.data.setUsage(THREE.DynamicDrawUsage);      
          pointsInsertedRef.current = true;
        }
        
        positionAttrRef.current.data.updateRanges.length = 0;
        colorAttrRef.current.data.updateRanges.length = 0;
        
        positionAttrRef.current.data.needsUpdate = true;
        colorAttrRef.current.data.needsUpdate = true;
        isWorkerBusy.current = false;  
        setIsLoaded(true);
      }

      else if (type == 'INSERT_DONE') {
        if(pointsInsertedRef.current == false) {
          geometryRef.current.setAttribute('position', positionAttrRef.current);
          geometryRef.current.setAttribute('color', colorAttrRef.current);
          positionAttrRef.current.data.setUsage(THREE.DynamicDrawUsage);
          colorAttrRef.current.data.setUsage(THREE.DynamicDrawUsage);      
          pointsInsertedRef.current = true;
          setIsLoaded(true)
        }
        isWorkerBusy.current = false; 
        // Send an ACK back to the server requesting the points to insert
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify({ type: 'ACK' }));
        }
      }

      else if (type == 'DELETE_DONE') {
        console.log('done deletion')
        isWorkerBusy.current = false; 
        geometryRef.current.setDrawRange(0, 0);
        
        positionAttrRef.current.data.updateRanges.length = 0;
        colorAttrRef.current.data.updateRanges.length = 0;
        
        positionAttrRef.current.data.needsUpdate = true;
        colorAttrRef.current.data.needsUpdate = true;  
      }

      else if (type === 'CLEAR_DONE') {
        console.log('Octree has been successfully cleared.')
        isWorkerBusy.current = false;
        pointsInsertedRef.current = false;
        
        positionAttrRef.current.data.updateRanges.length = 0;
        colorAttrRef.current.data.updateRanges.length = 0;
        
        positionAttrRef.current.data.needsUpdate = true;
        colorAttrRef.current.data.needsUpdate = true;  
        geometryRef.current.setDrawRange(0, 0);
        setIsLoaded(false);
      }

      else if (type === 'UPDATE_DONE') {
        
        positionAttrRef.current.data.updateRanges.length = 0;
        colorAttrRef.current.data.updateRanges.length = 0;
        positionAttrRef.current.data.updateRanges.push({
          offset: 0,
          count: payload.vertexCount * 4 
        });
        colorAttrRef.current.data.updateRanges.push({
          offset: 0,
          count: payload.vertexCount * 16 
        });
        
        positionAttrRef.current.data.needsUpdate = true;
        colorAttrRef.current.data.needsUpdate = true;        
        geometryRef.current.setDrawRange(0, payload.vertexCount);
        isWorkerBusy.current = false;
      }

      else if (type === 'NO_UPDATE') {
        isWorkerBusy.current = false;
      }

      else if (type === 'SEGMENT_DONE') {
        console.log('segment done')
        if(pointsInsertedRef.current == false) {
          geometryRef.current.setAttribute('position', positionAttrRef.current);
          geometryRef.current.setAttribute('color', colorAttrRef.current);
          positionAttrRef.current.data.setUsage(THREE.DynamicDrawUsage);
          colorAttrRef.current.data.setUsage(THREE.DynamicDrawUsage);      
          pointsInsertedRef.current = true;
        }
        /*
        positionAttrRef.current.data.updateRanges.length = 0;
        colorAttrRef.current.updateRanges.length = 0;
        */
        positionAttrRef.current.data.needsUpdate = true;
        colorAttrRef.current.data.needsUpdate = true;
        isWorkerBusy.current = false;  
        setIsLoaded(true);
      }

      else if (type === 'SAVE_DONE') {
          const fileData = payload;
          const blob = new Blob([fileData], { type: 'application/octet-stream' });
          
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = (fileName || 'download') + '.ply'; 
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(url);
          isWorkerBusy.current = false;
      }
    }

  return () => {
    if (octreeWorkerRef.current) {
      octreeWorkerRef.current.onmessage = null;
    }
    
    octreeWorkerRef.current?.terminate();
    
    if (geometryRef.current) {
      geometryRef.current.dispose();
    }
    
    sharedUint8ViewRef.current = null;
    positionAttrRef.current = null;
    colorAttrRef.current = null;
  }
  }, [])


  useThrottledFrame((state) => {
    if (!isLoaded && !isWorkerBusy.current) return;

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
      maxLOD: displaySettings.octreeMaxLOD
    };

    octreeWorkerRef.current.postMessage({
      type: 'UPDATE',
      payload: cameraData
    });
  }, 3);

  return (
    <group position={position} rotation={rotation}>
      <points geometry={geometryRef.current} dispose={null} frustumCulled={false}>
        <pointsMaterial size={displaySettings.pointSize} sizeAttenuation vertexColors={true} />
      </points>
    </group>
  )
}

export default OctreeTest;