import * as THREE from 'three'
import { useEffect, useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import OctreeWorker from './octree.worker.js?worker' 



function OctreeTest({ websocketRef , octreeWorkerRef , isWorkerBusy , position , rotation , url , octreeMaxLOD , displaySettings }) {
  const { invalidate } = useThree()
  const [isLoaded, setIsLoaded] = useState(false)
  const geometryRef = useRef(new THREE.BufferGeometry())
  const positionAttrRef = useRef(null)
  const displaySettingsRef = useRef(displaySettings);
  const colorAttrRef = useRef(null)
  const pointsInsertedRef = useRef(false);
  const sharedUint8ViewRef = useRef(null);
  
  useEffect(() => {
    displaySettingsRef.current = displaySettings;
  }, [displaySettings]);

  useEffect(() => {
      invalidate();
      octreeWorkerRef.current = new OctreeWorker()
      octreeWorkerRef.current.onmessage = (e) => {
        setInterval(()=>{invalidate()}, 1)
        const { type, payload } = e.data;

        if (type === 'READY') {
          octreeWorkerRef.current.postMessage({ type: 'INIT', payload: { url } })
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
          positionAttrRef.current.data.needsUpdate = true;
          colorAttrRef.current.data.needsUpdate = true;  
        }

        else if (type === 'CLEAR_DONE') {
          console.log('Octree has been successfully cleared.')
          isWorkerBusy.current = false;
          pointsInsertedRef.current = false;
          positionAttrRef.current.data.needsUpdate = true;
          colorAttrRef.current.data.needsUpdate = true;  
          setIsLoaded(false);
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

        else if (type === 'SAVE_DONE') {
            const fileData = payload; 
            const currentSettings = displaySettingsRef.current;

            const blob = new Blob([fileData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = currentSettings['projectName'] || 'download'; 
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
            isWorkerBusy.current = false;
        }
      }
    return () => {octreeWorkerRef.current.terminate()}
  }, [url])


  const MAX_HZ = 30
  const INTERVAL = 1 / MAX_HZ
  const acc = useRef(0)
  useFrame((state, delta) => {
    acc.current += delta
    if (acc.current < INTERVAL) return
    acc.current -= INTERVAL
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
    
    octreeWorkerRef.current.postMessage({
      type: 'UPDATE',
      payload: cameraData
    });
    //console.log('ran update')
  });

  return (
    <group position={position} rotation={rotation}>
      <points geometry={geometryRef.current} dispose={null} frustumCulled={false}>
        <pointsMaterial size={0.02} sizeAttenuation vertexColors={true} />
      </points>
    </group>
  )
}

export default OctreeTest;