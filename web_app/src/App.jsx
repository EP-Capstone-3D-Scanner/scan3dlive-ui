import { useState} from 'react'
import './App.css';
import Canvas3D from './components/Canvas3D';
import Navigator from './components/Navigator';

function App() {
  return (
    <div class="vh-100 overflow-hidden">
      <Navigator></Navigator>
      <Canvas3D></Canvas3D>
    </div>
  )
}

export default App
