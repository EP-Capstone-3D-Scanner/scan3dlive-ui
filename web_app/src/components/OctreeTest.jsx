import * as THREE from 'three'
import { useEffect, useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import OctreeManager from '../modules/OctreeModuleCamTest.js'
import OctreeManager2 from '../modules/OctreeModulePLYInsertionTest.js'

function OctreeTest({ position, rotation, url, displaySettings }) {
  const [OctreeHelper, setOctreeHelper] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false) // NEW: Track loading state
  const { invalidate, size } = useThree()
  const OctreeGeometry = useRef(new THREE.BufferGeometry())
  const aspectRatio = useRef(size.width / size.height)
  const previousMaxLOD = useRef(displaySettings['octreeMaxLOD'])
  const lastVertexCountRef = useRef(0)
  const wasmHeapF32Ref = useRef(null)

  useEffect(() => {
    OctreeManager2({ print: console.log }).then(setOctreeHelper)
  }, [])

  useEffect(() => {
    aspectRatio.current = size.width / size.height
  }, [size.width, size.height])

  useEffect(() => {
    if (!OctreeHelper) return
    let cancelled = false

    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        if (cancelled) return

        const dataPtr = OctreeHelper._malloc(buffer.byteLength)
        OctreeHelper.HEAPU8.set(new Uint8Array(buffer), dataPtr)

        const headerSize = OctreeHelper._loadPointsXYZFromBinaryPLY(dataPtr, buffer.byteLength)

        // Create a copy for JS memory
        const cloudGeomDataArray = new Float32Array(
          OctreeHelper.HEAPF32.buffer,
          dataPtr + headerSize - 14,
          (buffer.byteLength - headerSize) / 4
        )

        OctreeHelper._free(dataPtr)

        OctreeGeometry.current.setAttribute('position', new THREE.BufferAttribute(cloudGeomDataArray, 3))
        //OctreeGeometry.current.computeBoundingSphere();
        setIsLoaded(true) // Now it's safe for useFrame to run
        invalidate()
      })

    return () => { cancelled = true }
  }, [url, OctreeHelper])

  
  useFrame((state, delta) => {
    //console.log(state.camera)

    // BUG FIX: Guard against running before data is ready
    if (!OctreeHelper || !isLoaded) return 

    const start = performance.now(); // Record the start time
    const pos = state.camera.position
    const vmi = state.camera.matrixWorldInverse.elements
    const pm = state.camera.projectionMatrix.elements

    OctreeHelper._updateOctreeCamera(
      pos.x, pos.y, pos.z,
      vmi[0], vmi[4], vmi[8], vmi[12], vmi[1], vmi[5], vmi[9], vmi[13],
      vmi[2], vmi[6], vmi[10], vmi[14], vmi[3], vmi[7], vmi[11], vmi[15],
      pm[0], pm[4], pm[8], pm[12], pm[1], pm[5], pm[9], pm[13],
      pm[2], pm[6], pm[10], pm[14], pm[3], pm[7], pm[11], pm[15],
      aspectRatio.current
    )

    const dataNodePtr = OctreeHelper._getVisibleOctreeNodes(displaySettings['octreeMaxLOD'], 1)
    const dataBytes = OctreeHelper.HEAPU32[dataNodePtr >> 2]

    const heapF32 = OctreeHelper.HEAPF32
    // Keep a reference so we can detect Wasm memory growth
    if (!wasmHeapF32Ref.current || wasmHeapF32Ref.current.buffer !== heapF32.buffer) {
      wasmHeapF32Ref.current = heapF32
    }

    const positionAttr = OctreeGeometry.current.attributes.position

    // SAFETY CHECK: Ensure we don't overflow the original buffer
    const dataLength = dataBytes / 4
    const vertexCount = Math.min(Math.floor(dataLength / 3), positionAttr.count)
    console.log(`Vertex Count: ${vertexCount}, Data Memory: ${dataBytes}, Heap Memory ${wasmHeapF32Ref.current.byteLength}, Buffer Capacity: ${positionAttr.count}`)
    // Start index in HEAPF32 (divide byte offset by 4)
    const startIndex = (dataNodePtr + 4) >> 2

    if (previousMaxLOD.current !== displaySettings['octreeMaxLOD'] || (vertexCount - lastVertexCountRef.current) > (lastVertexCountRef.current / 25) || (lastVertexCountRef.current - vertexCount) > (lastVertexCountRef.current / 25)) {
      // Copy directly from the Wasm heap to the existing BufferAttribute array
      const dst = positionAttr.array
      const toCopy = vertexCount * 3
      for (let i = 0, j = startIndex; i < toCopy; i++, j++) {
        dst[i] = heapF32[j]
      }
      positionAttr.needsUpdate = true
      OctreeGeometry.current.setDrawRange(0, vertexCount)
      lastVertexCountRef.current = vertexCount
      previousMaxLOD.current = displaySettings['octreeMaxLOD']
    }
    invalidate()
    OctreeHelper._free(dataNodePtr)
    
    const end = performance.now(); // Record the end time
    const duration = end - start;

    //console.log(`Execution time: ${duration} milliseconds`);
  })

  return (
    <group position={position} frustumCulled={false} rotation={rotation}>
      <points geometry={OctreeGeometry.current}>
        <pointsMaterial size={0.02} sizeAttenuation color="black" />
      </points>
    </group>
  )
}

export default OctreeTest;

/*

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

    */ 