import * as THREE from 'three'
import { useEffect, useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import OctreeManager from '../modules/OctreeModuleCamTest.js'


function OctreeTest({ position, rotation, url }) {
  const [OctreeHelper, setOctreeHelper] = useState(null)
  const OctreeGeometry = useRef(new THREE.BufferGeometry())
  const { invalidate, size } = useThree()

  // Load Emscripten Module
  useEffect(() => {
    OctreeManager({ print: console.log })
      .then(setOctreeHelper)
  }, [])

  // Load points
  useEffect(() => {
    if (!OctreeHelper) return
    let cancelled = false

    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        if (cancelled) return
        
        const fetchData = new DataView(buffer)
        const pointCount = fetchData.getUint32(0, true)
        const dataArray = new Float32Array(buffer, 8, pointCount * 3)
        const dataPtr = OctreeHelper._malloc(dataArray.length * 4)
        
        OctreeHelper.HEAPF32.set(dataArray, dataPtr >> 2)
        OctreeHelper._insertPoints(dataPtr, pointCount)
        OctreeHelper._free(dataPtr)

        OctreeGeometry.current.setAttribute('position',new THREE.BufferAttribute(dataArray, 3))
        OctreeGeometry.current.computeBoundingSphere();
        invalidate()
      })

    return () => { cancelled = true }
  }, [url, OctreeHelper])

  // Update octree each frame
  useFrame((state, delta) => {
    if (!OctreeHelper) return

    const vmi = state.camera.matrixWorldInverse.elements
    const pm = state.camera.projectionMatrix.elements

    OctreeHelper._updateOctreeCamera(
      vmi[0], vmi[4], vmi[8], vmi[12], vmi[1], vmi[5], vmi[9], vmi[13],
      vmi[2], vmi[6], vmi[10], vmi[14], vmi[3], vmi[7], vmi[11], vmi[15],
      pm[0], pm[4], pm[8], pm[12], pm[1], pm[5], pm[9], pm[13],
      pm[2], pm[6], pm[10], pm[14], pm[3], pm[7], pm[11], pm[15],
      size.width / size.height
    )

    const start = performance.now();
    const dataNodePtr = OctreeHelper._getVisibleOctreeNodes2(10, 50)
    const dataBytes = OctreeHelper.HEAPU32[dataNodePtr >> 2]
    const end = performance.now();
    const elapsedTime = end - start;

    console.log(`Execution time: ${elapsedTime} milliseconds`);

    const f32 = new Float32Array(
      OctreeHelper.HEAPF32.buffer,
      dataNodePtr + 4,
      dataBytes / 4
    )

    const positionAttr = OctreeGeometry.current.attributes.position
    const vertexCount = f32.length / 3

    positionAttr.array.set(f32)
    positionAttr.needsUpdate = true

    OctreeGeometry.current.setDrawRange(0, vertexCount)

    invalidate()
    OctreeHelper._free(dataNodePtr)
  })


  return (
    <group position={position} frustumCulled={false} rotation={rotation}>
      <points geometry={OctreeGeometry.current}>
        <pointsMaterial size={0.02} sizeAttenuation color="black" />
      </points>
    </group>
  )
}

export default OctreeTest
