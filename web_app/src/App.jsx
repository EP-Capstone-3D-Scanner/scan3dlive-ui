import { useState } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
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
  const [cameraFOV, setCameraFOV] = useState(75);
  const [annotations, setAnnotations] = useState(new Map());

  return (
    <div id="web_app" className="d-flex flex-column min-vh-100 position-static">
      <Navigator></Navigator>
      
      <Toolbar
        sidebarDisplay={sidebarDisplay} 
        setSidebarDisplay={setSidebarDisplay}>
      </Toolbar>
  
      <div id="web_app_container" className="d-flex flex-row flex-grow-1 overflow-hidden">
        <Canvas3D 
          selectedModel={selectedModel} 
          setSelectedModel={setSelectedModel}
          annotations={annotations}
          setAnnotations={setAnnotations}> 
        </Canvas3D>
        <Sidebar 
          sidebarDisplay={sidebarDisplay}
          clips={clips}
          setSelectedClips={setClips}>
        </Sidebar>
      </div>

      <Footer></Footer>

    <Modal
      show={false}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Modal heading
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Centered Modal</h4>
        <p>
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
          dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
          consectetur ac, vestibulum at eros.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button>Close</Button>
      </Modal.Footer>
    </Modal>
    </div>
  )
}

export default App
