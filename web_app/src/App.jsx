import Canvas3D from './components/Canvas3D';
import Navigator from './components/Navigator';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer'
import Toolbar from './components/Toolbar'
import { AppProvider } from './components/Contexts/Contexts';
import './App.css';

function App() {
  return (
    <AppProvider>
      <div id="web_app" className="d-flex flex-column min-vh-100 position-static">
        <Navigator></Navigator>
        <Toolbar></Toolbar>
        <div id="web_app_container" className="d-flex flex-row flex-grow-1 overflow-hidden">
          <Canvas3D></Canvas3D>
          <Sidebar></Sidebar>
        </div>
        <Footer></Footer>
      </div>
    </AppProvider>
  )
}

export default App
