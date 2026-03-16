import { useState , useRef } from 'react'
import Canvas3D from './components/Canvas3D';
import Navigator from './components/Navigator';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer'
import Toolbar from './components/Toolbar'
import useWebSocketClient from './components/Websocket';
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
    'showLabels':true,
    'skyboxPreset':'city',
    'octreeMaxLOD':1,
    'backgroundColor':'#000000',
    'backgroundVisible':false,
    'visibleModal': '',
    'projectName':'Untitled-0',
    'projectAuthor':'', 
    'description':''
  })
  
  const [volumeSelections, setVolumeSelections] = useState({});
  const [deletionSelection, setDeletionSelection] = useState({'position':[0, 0, 0], 'size':[1, 1, 1], 'rotation':[0, 0, 0]})

  const octreeWorkerRef = useRef(null)
  const isWorkerBusy = useRef(true)
  //const websocketRef = useWebSocketClient({urlxs : "wss://localhost:8001", scannerReconnecting : sidebarDisplay['scannerReconnecting'] , workerRef : octreeWorkerRef, isWorkerBusy:isWorkerBusy, setSidebarDisplay: setSidebarDisplay});
  //const websocketRef = useWebSocketClient({url: "wss://10.6.95.47:8001", scannerReconnecting : sidebarDisplay['scannerReconnecting'] , workerRef : octreeWorkerRef, isWorkerBusy:isWorkerBusy, setSidebarDisplay: setSidebarDisplay});
  const websocketRef = useWebSocketClient({url: "wss://192.168.2.15:8001", scannerReconnecting : sidebarDisplay['scannerReconnecting'] , workerRef : octreeWorkerRef, isWorkerBusy:isWorkerBusy, setSidebarDisplay: setSidebarDisplay});

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
          sidebarDisplay={sidebarDisplay}
          setSidebarDisplay={setSidebarDisplay}
          volumeSelections={volumeSelections}
          setVolumeSelections={setVolumeSelections}
          deletionSelection={deletionSelection}
          setDeletionSelection={setDeletionSelection}
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
          deletionSelection={deletionSelection}
          setDeletionSelection={setDeletionSelection}
          displaySettings={displaySettings}
          setDisplaySettings={setDisplaySettings}
          octreeWorkerRef={octreeWorkerRef}
          isWorkerBusy={isWorkerBusy}
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
