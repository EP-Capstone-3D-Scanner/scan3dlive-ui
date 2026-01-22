import { useState , useRef } from 'react'
import Canvas3D from './components/Canvas3D';
import Navigator from './components/Navigator';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer'
import Toolbar from './components/Toolbar'
import './App.css';

function App() {
  const [sidebarDisplay, setSidebarDisplay] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [clips, setClips] = useState({
    0:{type:"Cube", position:[1, 1, 1], rotation:160, size:100}, 
    1:{type:"Cube", position:[1, 1, 1], rotation:16, size:100},
    2:{type:"Cube", position:[1, 1, 1], rotation:16, size:100},
    3:{type:"Cube", position:[1, 1, 1], rotation:16, size:100},
    4:{type:"Cube", position:[1, 1, 1], rotation:16, size:100},
    5:{type:"Cube", position:[1, 1, 1], rotation:16, size:100},
    6:{type:"Cube", position:[1, 1, 1], rotation:16, size:100},
    7:{type:"Cube", position:[1, 1, 1], rotation:16, size:100},
    8:{type:"Cube", position:[1, 1, 1], rotation:16, size:100},
    9:{type:"Cube", position:[1, 1, 1], rotation:16, size:100},
    10:{type:"Cube", position:[1, 1, 1], rotation:16, size:100},
  });
  const cameraFOVRef = useRef(75);
  const [annotations, setAnnotations] = useState(new Map());

  return (
    <div 
      id="web_app" 
      className="d-flex flex-column min-vh-100 position-static"
    >
      <Navigator></Navigator>
      
      <Toolbar
        sidebarDisplay={sidebarDisplay} 
        setSidebarDisplay={setSidebarDisplay}
        cameraFOVRef={cameraFOVRef}
      >
      </Toolbar>
  
      <div 
        id="web_app_container" 
        className="d-flex flex-row flex-grow-1 overflow-hidden"
      >
        <Canvas3D 
          selectedModel={selectedModel} 
          setSelectedModel={setSelectedModel}
          annotations={annotations}
          setAnnotations={setAnnotations}
          cameraFOVRef={cameraFOVRef}
        > 
        </Canvas3D>
        
        <Sidebar 
          sidebarDisplay={sidebarDisplay}
          setSidebarDisplay={setSidebarDisplay}
          clips={clips}
          setSelectedClips={setClips}
        >
        </Sidebar>
      </div>

      <Footer></Footer>
    </div>
  )
}

export default App
