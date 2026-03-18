import OctreeTest from './OctreeTest'
import BackgroundManager from './Helpers/BackgroundManager';
import { VolumeSelectionBox } from './VolumeSelectionBox'
import { AppContext } from './Contexts/Contexts';
import { Canvas } from '@react-three/fiber'
import { useState , useContext } from 'react';
import {  OrbitControls , FirstPersonControls } from '@react-three/drei'


let invalidateRef = null
export function invalidateCanvas() {
  console.log('invalidated')
  invalidateRef?.()
}

let cameraRef = null
export function getCamera() {
  return cameraRef
}


function Canvas3D() {

  const { 
    volumeSelections, 
    setVolumeSelections, 
    deletionSelection, 
    setDeletionSelection, 
    displaySettings, 
    sidebarDisplay, 
    userHistory
  } = useContext(AppContext)

  const [orbitEnabled, setOrbitEnabled] = useState(true);

  return (
    <div id="Canvas3D" className="w-100">
      <Canvas
        onCreated={(state) => {
          invalidateRef = state.invalidate;
          cameraRef = state.camera;
        }}
        camera={{ fov: 75, position: [0, 1.5, 12] }}
      >
        <BackgroundManager displaySettings={displaySettings}/>
        <gridHelper visible={displaySettings.gridVisible} args={[10]}/>

        {Object.keys(volumeSelections).map(
          volumeId => (
            <VolumeSelectionBox
              key = {volumeId}
              isDeletion={false}
              volumeId = {volumeId}
              volumeSelections={volumeSelections} 
              setVolumeSelections={setVolumeSelections}
              setOrbitControlsEnabled={setOrbitEnabled} 
              showLabel={displaySettings.showLabels}
              userHistory={userHistory}
              focusColor="#ffcc00" 
              color="#0088ff"
            />
          )
        )}

        {(
          sidebarDisplay.page == 'DeletionSelectionMenu') && 
          sidebarDisplay.show &&
          <VolumeSelectionBox
            isDeletion={true}
            deletionSelection={deletionSelection}
            setDeletionSelection={setDeletionSelection}
            setOrbitControlsEnabled={setOrbitEnabled} 
            userHistory={userHistory}
            focusColor="#ff0000" 
            color="#fd0000"
          />
        }

        <OrbitControls makeDefault enabled={orbitEnabled} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} />
        <OctreeTest position={[0, 0, 0]} rotation={[0, 0, 0]}/>
      </Canvas>
    </div>
  );
}

export default Canvas3D;