import * as THREE from 'three'
import { useEffect, useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import OctreeManager from '../modules/OctreeModulePLYInsertionTest.js'

function OctreeTest({ position, rotation, url, displaySettings }) {
  const [OctreeHelper, setOctreeHelper] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false) // NEW: Track loading state
  const { invalidate, size } = useThree()
  const OctreeGeometry = useRef(new THREE.BufferGeometry())
  const aspectRatio = useRef(size.width / size.height)
  const previousMaxLOD = useRef(displaySettings['octreeMaxLOD'])
  const lastVertexCountRef = useRef(0)

  useEffect(() => {
    OctreeManager({ print: console.log }).then(setOctreeHelper)
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

        const ALIGNMENT = 32;
        const headerSize = OctreeHelper._loadPointsXYZFromBinaryPLY(dataPtr, buffer.byteLength)
        const rawDataStart = dataPtr + headerSize;
        const alignedDataStart = (rawDataStart + (ALIGNMENT - 1)) & ~(ALIGNMENT - 1);
        console.log(`Header Size: ${headerSize} bytes`)
        // Create a copy for JS memory
        const cloudGeomDataArray = new Float32Array(
          OctreeHelper.HEAPF32.buffer,
          alignedDataStart,
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

  const MAX_HZ = 25
  const INTERVAL = 1 / MAX_HZ
  const acc = useRef(0)

  useFrame((state, delta) => {
    acc.current += delta
    if (acc.current < INTERVAL) return
    acc.current -= INTERVAL
    //console.log(state.camera)

    if (!OctreeHelper || !isLoaded) return 

    const pos = state.camera.position
    const vmi = state.camera.matrixWorldInverse.elements
    const pm = state.camera.projectionMatrix.elements
    const positionAttr = OctreeGeometry.current.attributes.position

    OctreeHelper._updateOctreeCamera(
      pos.x, pos.y, pos.z,
      vmi[0], vmi[4], vmi[8], vmi[12], vmi[1], vmi[5], vmi[9], vmi[13],
      vmi[2], vmi[6], vmi[10], vmi[14], vmi[3], vmi[7], vmi[11], vmi[15],
      pm[0], pm[4], pm[8], pm[12], pm[1], pm[5], pm[9], pm[13],
      pm[2], pm[6], pm[10], pm[14], pm[3], pm[7], pm[11], pm[15],
      aspectRatio.current
    )

    const start = performance.now();
    const dataNodePtr = OctreeHelper._getVisibleOctreeNodes(displaySettings['octreeMaxLOD'], 5)
    const end = performance.now();
    
    const dataBytes = OctreeHelper.HEAPU32[dataNodePtr >> 2]
    const dataLength = dataBytes / 4
    const vertexCount = Math.min(Math.floor(dataLength / 3), positionAttr.count)
    const toCopy = vertexCount * 3
    const startIndex = (dataNodePtr + 4) >> 2
    
    //console.log(`Vertex Count: ${vertexCount}, Data Memory: ${dataBytes}, Heap Memory ${wasmHeapF32Ref.current.byteLength}, Buffer Capacity: ${positionAttr.count}`)

    
    if (previousMaxLOD.current !== displaySettings['octreeMaxLOD'] || (vertexCount - lastVertexCountRef.current) > (lastVertexCountRef.current / 25) || (lastVertexCountRef.current - vertexCount) > (lastVertexCountRef.current / 25)) {
      const dst = positionAttr.array
      dst.set(OctreeHelper.HEAPF32.subarray(startIndex, startIndex + toCopy))
      positionAttr.needsUpdate = true
      OctreeGeometry.current.setDrawRange(0, vertexCount)
      lastVertexCountRef.current = vertexCount
      previousMaxLOD.current = displaySettings['octreeMaxLOD']
      invalidate()
    }
    
    OctreeHelper._free(dataNodePtr)
    const duration = end - start;

    console.log(`Execution time: ${duration} milliseconds`);
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