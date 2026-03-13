import { useEffect , useRef } from "react";

function useWebsocketClient({url, scannerReconnecting , workerRef, isWorkerBusy, setSidebarDisplay}) {
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket(url);
        ws.current.binaryType = "arraybuffer";
        
        ws.current.onerror = (error) => {
            console.log('Websocket failed to connect')
        }

        ws.current.onopen = () => {
            console.log("WebSocket connection established");
            setSidebarDisplay(prev => ({...prev, scannerOnline: true}));
        }

        ws.current.onclose = () => {
            console.log("WebSocket connection closed");
            setSidebarDisplay(prev => ({...prev, scannerOnline: false}));
        }

        ws.current.onmessage = (event) => {
            if(workerRef) { // && !isWorkerBusy.current
                isWorkerBusy.current = true;
                workerRef.current.postMessage({type: 'INSERT', payload: event.data})
            }
        }

        return () => {
            ws.current.close();
        };
    }, [url, scannerReconnecting])

    return ws
}

export default useWebsocketClient;