import { useState , useRef } from 'react'
import Canvas3D from './components/Canvas3D';
import Navigator from './components/Navigator';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer'
import Toolbar from './components/Toolbar'
import useWebSocketClient from './components/Websocket';
import { ScannerConnectionStatusToast } from './components/Modals';
import './App.css';

function App() {
  //Need to rename this variable lol (sto fix the showscanner online modal, make other variables more descriptive)
  const [sidebarDisplay, setSidebarDisplay] = useState({
    'page':'EditViewSelectionsMenu',
    'scannerOnline':false, 
    'show':false
  });
  const [displaySettings, setDisplaySettings] = useState({
    'gridVisible':true,
    'skyboxVisible':false,
    'skyboxPreset':'city',
    'octreeMaxLOD':1,
    'backgroundColor':'#000000',
    'backgroundVisible':false,
  })
  const [selectedModel, setSelectedModel] = useState(null);
  const [clips, setClips] = useState({
    0:{type:"Cube", position:[1, 1, 1], rotation:160, size:100}, 
  });
  const [annotations, setAnnotations] = useState(new Map());
  
  useWebSocketClient({url: "ws://192.168.2.15:8001", setSidebarDisplay: setSidebarDisplay});
  return (
    <div 
      id="web_app" 
      className="d-flex flex-column min-vh-100 position-static"
    >
      <Navigator
        sidebarDisplay={sidebarDisplay} 
        setSidebarDisplay={setSidebarDisplay}
      >
      </Navigator>
      
      <Toolbar
        sidebarDisplay={sidebarDisplay} 
        setSidebarDisplay={setSidebarDisplay}
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
          displaySettings={displaySettings}
          setDisplaySettings={setDisplaySettings}
        > 
        </Canvas3D>
        
        <Sidebar 
          sidebarDisplay={sidebarDisplay}
          setSidebarDisplay={setSidebarDisplay}
          clips={clips}
          setSelectedClips={setClips}
          displaySettings={displaySettings}
          setDisplaySettings={setDisplaySettings}
        >
        </Sidebar>
      </div>
      <ScannerConnectionStatusToast></ScannerConnectionStatusToast>
      <Footer></Footer>
    </div>
  )
}

export default App
