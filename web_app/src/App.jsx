import { useState } from 'react'
import Canvas3D from './components/Canvas3D';
import Navigator from './components/Navigator';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer'
import Toolbar from './components/Toolbar'
import './App.css';

function App() {
  const [sidebarDisplay, setSidebarDisplay] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [annotations, setAnnotations] = useState(new Map());

  return (
    <div id="web_app" className="d-flex flex-column min-vh-100">
      <Navigator 
        sidebarDisplay={sidebarDisplay} 
        setSidebarDisplay={setSidebarDisplay}>
      </Navigator>
      <Toolbar></Toolbar>
  
      <div id="web_app_container" className="d-flex flex-row flex-grow-1 overflow-hidden">
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

      <Footer></Footer>
    </div>
  )
}

export default App
