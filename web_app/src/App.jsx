import { useState} from 'react'
import './App.css';
import Canvas3D from './components/Canvas3D';
import Navigator from './components/Navigator';
import Sidebar from './components/Sidebar';


function App() {
  return (
    <div id="web_app" class="vh-100">
      <Navigator></Navigator>
      <div id="web_app_container">
        <Canvas3D></Canvas3D>
      </div>
    </div>
  )
}

export default App
