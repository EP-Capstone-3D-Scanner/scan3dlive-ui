import { useState } from 'react'
import './App.css'
import { Canvas } from '@react-three/fiber'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div id="canvas-container">
      <Canvas style={{backgroundColor:'deepskyblue'}}></Canvas>
    </div>
    </>
  )
}

export default App
