import { useState , useEffect , useRef } from "react";

function useWebsocketClient({url, workerRef, isWorkerBusy}) {

    const websocketRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [reconnectCount, setReconnectCount] = useState(0);

    const reconnect = () => {
        console.log('[WEBSOCKET] WebSocket attempting to reconnect')
        setReconnectCount(prev=>(prev+1))
    }

    useEffect(() => {
        websocketRef.current = new WebSocket(url);
        websocketRef.current.binaryType = "arraybuffer";
        
        websocketRef.current.onerror = (error) => {
            console.log('[WEBSOCKET] Websocket failed to connect')
            setConnected(false)
        }

        websocketRef.current.onopen = () => {
            console.log("[WEBSOCKET] WebSocket connection established");
            setConnected(true)
        }

        websocketRef.current.onclose = () => {
            console.log("[WEBSOCKET] WebSocket connection closed");
            setConnected(false)
        }

        websocketRef.current.onmessage = (event) => {
            if(workerRef.current) { // && !isWorkerBusy.current
                isWorkerBusy.current = true;
                workerRef.current.postMessage({
                    type: 'INSERT', 
                    payload: event.data
                })
            }
        }

        return () => {
            websocketRef.current.close();
        };
    }, [url, reconnectCount])

    return {websocketRef, connected, reconnect}
}

export default useWebsocketClient;