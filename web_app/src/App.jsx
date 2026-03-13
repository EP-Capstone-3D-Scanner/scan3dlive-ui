import { useState , useRef, useEffect } from 'react'
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
    'selectedVolume':-1, // which volume is selected in update
    'selectedVolumeNew':false, // is te volume in update menu new?
    'scannerOnline':false,
    'scannerReconnecting':0, // trigger for recconet. need to give better name
    'pointLabelType':'',
    'show':false // Need to rename, show the sidebar or not?
  });
  
  const [displaySettings, setDisplaySettings] = useState({
    'gridVisible':true,
    'skyboxVisible':false,
    'skyboxPreset':'city',
    'octreeMaxLOD':1,
    'backgroundColor':'#000000',
    'backgroundVisible':false,
    'visibleModal': ''
  })
  
  const [volumeSelections, setVolumeSelections] = useState({});
  
  const octreeWorkerRef = useRef(null)
  const isWorkerBusy = useRef(true)
  const websocketRef = useWebSocketClient({url: "wss://localhost:8001", scannerReconnecting : sidebarDisplay['scannerReconnecting'] , workerRef : octreeWorkerRef, isWorkerBusy:isWorkerBusy, setSidebarDisplay: setSidebarDisplay});
  //const websocketRef = useWebSocketClient({url: "wss://10.6.95.47:8001", scannerReconnecting : sidebarDisplay['scannerReconnecting'] , workerRef : octreeWorkerRef, isWorkerBusy:isWorkerBusy, setSidebarDisplay: setSidebarDisplay});
  
  
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
        websocketRef={websocketRef}
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
          scannerReconnecting={sidebarDisplay['scannerReconnecting']}
          volumeSelections={volumeSelections}
          setVolumeSelections={setVolumeSelections}
          octreeWorkerRef={octreeWorkerRef}
          websocketRef={websocketRef}
          isWorkerBusy={isWorkerBusy}
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
      
      <Footer 
        displaySettings={displaySettings}
        setDisplaySettings={setDisplaySettings}
        scannerOnline={sidebarDisplay['scannerOnline']}
      >
      </Footer>
    </div>
  )
}

export default App
