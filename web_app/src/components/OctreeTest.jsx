import * as THREE from 'three'
import { useEffect, useState , useRef } from 'react'
import { useFrame} from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import OctreeManager from '../modules/OctreeModuleCamTest.js'; // Emscripten Module

function parseOctreeAABBs(pointData) {
  const boxes = []
  let i = 0
  while (i < pointData.length) {
    const nodeId = pointData[i++] | 0;

    const min = [
      pointData[i++],
      pointData[i++],
      pointData[i++],
    ]

    const max = [
      pointData[i++],
      pointData[i++],
      pointData[i++],
    ]

    const pointCount = pointData[i++] | 0;
    boxes.push({ nodeId, min, max })

    // skip point data (3 floats per point)
    i += pointCount * 3
  }

  return boxes
}

function aabbToTransform(min, max) {
  const size = [
    max[0] - min[0],
    max[1] - min[1],
    max[2] - min[2],
  ]

  const center = [
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2,
  ]
  return { size, center }
}

function OctreeBoxes({ boxes }) {
  return (
    <>
      {boxes.map(({ nodeId, min, max }) => {
        const { size, center } = aabbToTransform(min, max)
        return (
          <mesh key={nodeId} position={center}>
            <boxGeometry args={size} />
            <meshBasicMaterial transparent opacity={0} />
            <Edges color="red" />
          </mesh>
        )
      })}
    </>
  )
}



function OctreeTest({ position, rotation, url }) {
  const [geometry, setGeometry] = useState(null)
  const [boxes, setBoxes] = useState([])
  const [OctreeHelper, setOctreeHelper] = useState(null)

  /** Throttle code to run 1 time per second */
  const MAX_HZ = 5
  const INTERVAL = 1 / MAX_HZ
  const acc = useRef(0)

  /** Load Emscripten Module */
  useEffect(()=>{
    OctreeManager({ print: (text) => {console.log(text)} })
      .then(
        (res) =>{
          setOctreeHelper(res);
        }
      )
  }, [])

  /** Update Emscripten Module When it Changes */
  /*
  useEffect(() => {
    if (OctreeHelper) {
      console.log("Octree View updated:", OctreeHelper);
      globalThis.OctreeHelper = OctreeHelper;
    }
  }, [OctreeHelper]);
  */
  
  /** Add points to octree and create geometry */
  useEffect(() => {
    let cancelled = false

    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        if (cancelled || !OctreeHelper) return

        const fetchData = new DataView(buffer)
        const pointCount = fetchData.getUint32(0, true)
        const maxDepth = fetchData.getUint32(4, true)
        const dataArray = new Float32Array(buffer, 8, pointCount*3)
        const dataPtr = OctreeHelper._malloc(dataArray.length*4);
        OctreeHelper.HEAPF32.set(dataArray, dataPtr >> 2)
        OctreeHelper._insertPoints(dataPtr, pointCount)
        OctreeHelper._free(dataPtr)   
        

        const geom = new THREE.BufferGeometry()
        geom.setAttribute(
          'position',
          new THREE.BufferAttribute(dataArray, 3)
        )

        setGeometry(geom)

      })

    return () => { cancelled = true }
  }, [url, OctreeHelper])


  useFrame((state, delta) => {
    
    if(!OctreeHelper || !geometry) return;

    acc.current += delta
    if (acc.current < INTERVAL) return
    acc.current -= INTERVAL
        
    const vmi = state.camera.matrixWorldInverse.elements;
    const pm = state.camera.projectionMatrix.elements;
    
    OctreeHelper._updateOctreeCamera(
      vmi[0], vmi[4], vmi[8], vmi[12],
      vmi[1], vmi[5], vmi[9], vmi[13],
      vmi[2], vmi[6], vmi[10], vmi[14],
      vmi[3], vmi[7], vmi[11], vmi[15],
      pm[0], pm[4], pm[8], pm[12],
      pm[1], pm[5], pm[9], pm[13],
      pm[2], pm[6], pm[10], pm[14],
      pm[3], pm[7], pm[11], pm[15],
      state.size.width/state.size.height
    )
  
    const dataNodePtr = OctreeHelper._getVisibleOctreeNodes(2, 10);
    const dataBytes = OctreeHelper.HEAPU32[dataNodePtr >> 2];

    const f32 = new Float32Array(
      OctreeHelper.HEAPF32.buffer,
      dataNodePtr + 4,
      dataBytes / 4
    )

    const parsed = parseOctreeAABBs(new Float32Array(f32))
    setBoxes(parsed)

    OctreeHelper._free(dataNodePtr)

    console.log(boxes);
    
  })

  if (!geometry) return null

  return (
    <group position={position} rotation={rotation}>
      <OctreeBoxes boxes={boxes} />
      <points 
        scale={1} 
        geometry={geometry}
      >
        <pointsMaterial
          size={0.05}
          sizeAttenuation
          color="black"
        />
      </points>
    </group>
  )
}


export default OctreeTest;