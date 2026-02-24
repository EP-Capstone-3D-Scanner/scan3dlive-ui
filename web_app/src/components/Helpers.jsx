import { Edges } from '@react-three/drei'

function AnimatedBox() {
    const boxRef = useRef();

    useFrame(()=>{
        boxRef.current.rotation.x+=0.01;
        boxRef.current.rotation.y+=0.01;
        boxRef.current.rotation.z+=0.01;
    })

    return (
        <mesh ref={boxRef} position={[0, 0 , 0]}>
        <torusKnotGeometry args={[1.7, 0.3, 256, 256]}></torusKnotGeometry>
        <meshToonMaterial color={0x00bfff}></meshToonMaterial>
        </mesh>
    )
}

function parseOctreeAABBs(pointData) {
  const boxes = []
  let i = 0
  while (i < pointData.length) {
    const nodeId = pointData[i++] | 0
    const min = [pointData[i++], pointData[i++], pointData[i++]]
    const max = [pointData[i++], pointData[i++], pointData[i++]]
    const pointCount = pointData[i++] | 0
    boxes.push({ nodeId, min, max })
    i += pointCount * 3 // skip point data
  }
  return boxes
}

function aabbToTransform(min, max) {
  const size = [max[0]-min[0], max[1]-min[1], max[2]-min[2]]
  const center = [(min[0]+max[0])/2, (min[1]+max[1])/2, (min[2]+max[2])/2]
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

function Model({chunk, position, annotations, setAnnotations, selectedModel, setSelectedModel}) {
  const geometry = useLoader(PLYLoader, 'point_clouds/test1.ply');

  const handlePointsClick = (e) => {
    e.stopPropagation();     // keep event from hitting other objects
    setSelectedModel(chunk)
    console.log(selectedModel)
    if(e.shiftKey) {
      const id = annotations.size ? Math.max(...annotations.keys()) + 1 : 1;
      setAnnotations(prev=> new Map(prev).set(id, {"Model": chunk, "label":id, "position": e.point}))
      console.log({"Model": chunk, "label":id, "position": e.point})
    }
  }
  
  return (
    <points onClick={handlePointsClick} rotation={[-Math.PI/2, 0, Math.PI/2]}  position={position} geometry={geometry} scale={2}>
      <pointsMaterial
        sizeAttenuation={true}
        size={0.00001}          // size of each point
        vertexColors         // if your PLY has colors
        color="white"        // fallback color
      />
    </points>
  );
}

/* THROTTLING CODE

// Put this at the start of the compenent
  const MAX_HZ = 30
  const INTERVAL = 1 / MAX_HZ
  const acc = useRef(0)

//Put this at the start of the useEffect
    acc.current += delta
    if (acc.current < INTERVAL) return
    acc.current -= INTERVAL



*/
