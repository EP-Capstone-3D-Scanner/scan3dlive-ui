import { useState} from 'react'
import './App.css';
import Canvas3D from './components/Canvas3D';
import Navigator from './components/Navigator';
import Sidebar from './components/Sidebar';


function App() {
  const [sidebarDisplay, setSidebarDisplay] = useState(false);

  return (
    <div id="web_app" class="vh-100">
      <Navigator sidebarDisplay={sidebarDisplay} setSidebarDisplay={setSidebarDisplay}></Navigator>
      <div id="web_app_container">
        <Canvas3D></Canvas3D>
        <Sidebar sidebarDisplay={sidebarDisplay} setSidebarDisplay={setSidebarDisplay}></Sidebar>
      </div>
    </div>
  )
}

export default App
