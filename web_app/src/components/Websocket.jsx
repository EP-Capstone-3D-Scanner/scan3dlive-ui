import { useEffect } from "react";

function useWebsocketClient({url, workerRef, isWorkerBusy, pointsInsertedRef, setSidebarDisplay}) {;
    useEffect(() =>{
        const ws = new WebSocket(url);
        ws.binaryType = "arraybuffer";
        
        ws.onopen = () => {
            console.log("WebSocket connection established");
            setSidebarDisplay(prev => ({...prev, scannerOnline: true}));
        }

        ws.onclose = () => {
            console.log("WebSocket connection closed");
            setSidebarDisplay(prev => ({...prev, scannerOnline: false}));
        }

        ws.onmessage = (event) => {
            if(workerRef) {
                isWorkerBusy.current = true;
                workerRef.current.postMessage({type: 'INSERT', payload: event.data})
                pointsInsertedRef.current = true;
            }
        }

        return () => {
            ws.close();
        };
    }, [url])
}

export default useWebsocketClient;