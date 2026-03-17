import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useEffect , Suspense } from 'react';
import { Environment } from '@react-three/drei'

const BackgroundManager = ({ displaySettings }) => {
  const { scene, invalidate } = useThree();

  useEffect(() => {
    if (!displaySettings.skyboxVisible) {
      if (displaySettings.backgroundVisible) {
        scene.background = new THREE.Color(displaySettings.backgroundColor);
      } else {
        scene.background = null;
      }
    }
    setTimeout(() => invalidate(), 1);
  }, [displaySettings.skyboxVisible, displaySettings.backgroundVisible, displaySettings.backgroundColor]);

  if (displaySettings.skyboxVisible) {
    return (
      <Suspense fallback={null}>
        <Environment
          key={displaySettings.skyboxPreset}
          preset={displaySettings.skyboxPreset}
          background
          onLoad={() => invalidate()}
        />
      </Suspense>
    )
  }

  return null;
};

export default BackgroundManager;