import * as THREE from 'three'
import { useEffect, useMemo, useState } from 'react'

function OctreeTest({ position, url }) {
  const [geometry, setGeometry] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        if (cancelled) return

        const view = new DataView(buffer)

        const pointCount = view.getUint32(0, true)
        console.log(pointCount);
        // const maxDepth = view.getUint32(4, true) // optional

        const positions = new Float32Array(
          buffer,
          8,
          pointCount * 3
        )

        const geom = new THREE.BufferGeometry()
        geom.setAttribute(
          'position',
          new THREE.BufferAttribute(positions, 3)
        )

        setGeometry(geom)
      })

    return () => { cancelled = true }
  }, [url])

  if (!geometry) return null

  return (
    <points position={position} rotation={[-Math.PI/2, 0, Math.PI/2]} scale={2} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        sizeAttenuation
        color="black"
      />
    </points>
  )
}

export default OctreeTest;