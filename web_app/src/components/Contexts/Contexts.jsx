import { useState, useRef , createContext } from 'react'
import useWebSocketClient from '../Hooks/Websocket';
import useUndoRedo from '../Hooks/UndoRedo';

export const AppContext = createContext(null);

export const AppProvider = ({children}) => {
    
    const octreeWorkerRef = useRef(null)
    const isWorkerBusy = useRef(true)

    const [volumeSelections, setVolumeSelections] = useState({});

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

