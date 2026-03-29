import { useState, useRef , useCallback , createContext } from 'react'
import useWebSocketClient from '../Hooks/Websocket';
import useUndoRedo from '../Hooks/UndoRedo';
import * as THREE from 'three';
import { getCamera } from '../Canvas3D';

export const AppContext = createContext(null);

export const AppProvider = ({children}) => {
    
    const octreeWorkerRef = useRef(null)
    const isWorkerBusy = useRef(true)

    const [volumeSelections, setVolumeSelections] = useState({});
    const [clipboardData, setClipboardData] = useState(null);
    const [activeVolumeId, setActiveVolumeId] = useState(null);

    const [deletionSelection, setDeletionSelection] = useState({
        position: [0, 0, 0], 
        size: [1, 1, 1], 
        rotation: [0, 0, 0]
    })
    
    const [sidebarDisplay, setSidebarDisplay] = useState({
        page: 'EditViewSelectionsMenu',
        selectedVolume: -1,
        selectedVolumeNew: false,
        show: false
    });
    
    const [displaySettings, setDisplaySettings] = useState({
        gridVisible: true,
        skyboxVisible: false,
        showLabels: true,
        skyboxPreset: 'city',
        octreeMaxLOD: 1,
        pointSize: 0.02,
        pointLabelType: '',
        backgroundColor: '#000000',
        backgroundVisible: false,
        visibleModal: '',
        projectName: 'Untitled-0',
        projectAuthor: '', 
        description: ''
    })

    const { websocketRef, connected , reconnect } = useWebSocketClient({
        url: "wss://10.6.95.47:8001", //wss://192.168.2.15:8001 wss://localhost:8001 wss://10.6.95.47:8001
        workerRef: octreeWorkerRef, 
        isWorkerBusy: isWorkerBusy
    }); 

    const { userHistory } = useUndoRedo({
        volumeSelections,
        setVolumeSelections,
        deletionSelection,
        setDeletionSelection,
        sidebarDisplay,
        setSidebarDisplay
    })
    
    const copySelection = useCallback(() => {
        if (!activeVolumeId || !volumeSelections[activeVolumeId]) return;
        
        const camera = getCamera();
        if (!camera) return;

        const volume = volumeSelections[activeVolumeId];
        const worldPos = new THREE.Vector3(...volume.position);
        
        camera.updateMatrixWorld();
        const relativePos = worldPos.clone().applyMatrix4(camera.matrixWorldInverse);

        setClipboardData({
            volumeData: JSON.parse(JSON.stringify(volume)),
            relativePos: relativePos.toArray()
        });
    }, [activeVolumeId, volumeSelections]);

    const cutSelection = useCallback(() => {
        if (!activeVolumeId || !volumeSelections[activeVolumeId]) return;
        
        copySelection();

        userHistory.pushUndoStack();
        setVolumeSelections(prev => {
            const next = { ...prev };
            delete next[activeVolumeId];
            return next;
        });
        setActiveVolumeId(null);
    }, [activeVolumeId, volumeSelections, copySelection, userHistory]);

    const pasteSelection = useCallback(() => {
        if (!clipboardData) return;

        const camera = getCamera();
        if (!camera) return;

        userHistory.pushUndoStack();

        const relativePos = new THREE.Vector3(...clipboardData.relativePos);
        camera.updateMatrixWorld();
        const newWorldPos = relativePos.clone().applyMatrix4(camera.matrixWorld);

        const existingKeys = Object.keys(volumeSelections);
        const maxId = existingKeys.length > 0 
            ? Math.max(...existingKeys.map(k => {
                const num = parseInt(k.replace(/\D/g, ''), 10);
                return isNaN(num) ? 0 : num;
              }))
            : 0;
        const newId = String(maxId + 1);

        const newVolume = {
            ...clipboardData.volumeData,
            position: [newWorldPos.x, newWorldPos.y, newWorldPos.z],
            name: `Object-${newId}`
        };

        setVolumeSelections(prev => ({ ...prev, [newId]: newVolume }));
        setActiveVolumeId(newId);
    }, [clipboardData, volumeSelections, userHistory]);

    return (
        <AppContext.Provider 
            value={{
                sidebarDisplay, 
                setSidebarDisplay, 
                displaySettings, 
                setDisplaySettings, 
                volumeSelections, 
                setVolumeSelections, 
                deletionSelection, 
                setDeletionSelection,
                clipboardData, 
                copySelection, 
                cutSelection, 
                pasteSelection,
                setClipboardData,
                activeVolumeId, 
                setActiveVolumeId,
                websocketRef,
                connected, 
                reconnect, 
                octreeWorkerRef, 
                isWorkerBusy,
                userHistory
            }}>
            {children}
        </AppContext.Provider>
    );
}

