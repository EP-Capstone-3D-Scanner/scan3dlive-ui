import { useState , useRef, useEffect } from 'react'
import Canvas3D from './components/Canvas3D';
import Navigator from './components/Navigator';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer'
import Toolbar from './components/Toolbar'
import { ScannerConnectionStatusToast } from './components/Modals';
import './App.css';

function App() {
  //Need to rename this variable lol (sto fix the showscanner online modal, make other variables more descriptive)
  const [sidebarDisplay, setSidebarDisplay] = useState({
    'page':'EditViewSelectionsMenu',
    'selectedVolume':-1,
    'selectedVolumeNew':false,
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
  
  const [volumeSelections, setVolumeSelections] = useState({});
  
  const octreeWorkerRef = useRef(null)
  
  //useWebSocketClient({url: "ws://192.168.2.15:8001", setSidebarDisplay: setSidebarDisplay});
  return (
    <div 
      id="web_app" 
      className="d-flex flex-column min-vh-100 position-static"
      style={{'overflow':'hidden'}}
    >
      <Navigator
        sidebarDisplay={sidebarDisplay} 
        setSidebarDisplay={setSidebarDisplay}
        octreeWorkerRef={octreeWorkerRef}
        displaySettings={displaySettings}
        setDisplaySettings={setDisplaySettings}
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
          displaySettings={displaySettings}
          setDisplaySettings={setDisplaySettings}
          setSidebarDisplay={setSidebarDisplay}
          volumeSelections={volumeSelections}
          setVolumeSelections={setVolumeSelections}
          octreeWorkerRef={octreeWorkerRef}
        > 
        </Canvas3D>
        
        <Sidebar 
          sidebarDisplay={sidebarDisplay}
          setSidebarDisplay={setSidebarDisplay}
          volumeSelections={volumeSelections}
          setVolumeSelections={setVolumeSelections}
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
