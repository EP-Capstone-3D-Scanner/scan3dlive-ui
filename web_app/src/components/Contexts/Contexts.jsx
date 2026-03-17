import { useState, useRef , createContext } from 'react'
import useWebSocketClient from '../Hooks/Websocket';

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
        backgroundColor: '#000000',
        backgroundVisible: false,
        visibleModal: '',
        projectName: 'Untitled-0',
        projectAuthor: '', 
        description: ''
    })

    const { websocketRef, connected , reconnect } = useWebSocketClient({
        url: "wss://192.168.2.15:8001", 
        workerRef: octreeWorkerRef, 
        isWorkerBusy: isWorkerBusy
    }); 

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
                isWorkerBusy
            }}>
            {children}
        </AppContext.Provider>
    );
}

    //const websocketRef = useWebSocketClient({urlxs : "wss://localhost:8001", scannerReconnecting : sidebarDisplay['scannerReconnecting'] , workerRef : octreeWorkerRef, isWorkerBusy:isWorkerBusy, setSidebarDisplay: setSidebarDisplay});
    //const websocketRef = useWebSocketClient({url: "wss://10.6.95.47:8001", scannerReconnecting : sidebarDisplay['scannerReconnecting'] , workerRef : octreeWorkerRef, isWorkerBusy:isWorkerBusy, setSidebarDisplay: setSidebarDisplay});