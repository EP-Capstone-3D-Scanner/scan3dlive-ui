import { useState} from 'react'
import './App.css';
import Canvas3D from './components/Canvas3D';
import Navigator from './components/Navigator';
import Sidebar from './components/Sidebar';


function App() {
  const [sidebarDisplay, setSidebarDisplay] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [annotations, setAnnotations] = useState(new Map());

  return (
    <div id="web_app" class="vh-100">
      <Navigator sidebarDisplay={sidebarDisplay} setSidebarDisplay={setSidebarDisplay}></Navigator>
      <div id="web_app_container">
        <Canvas3D 
          selectedModel={selectedModel} 
          setSelectedModel={setSelectedModel}
          annotations={annotations}
          setAnnotations={setAnnotations}> 
        </Canvas3D>
        <Sidebar 
          sidebarDisplay={sidebarDisplay} 
          setSidebarDisplay={setSidebarDisplay}
          annotations={annotations}
          setAnnotations={setAnnotations}>
        </Sidebar>
      </div>
    </div>
  )
}

export default App
