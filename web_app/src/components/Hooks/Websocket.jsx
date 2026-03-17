import { useState , useEffect , useRef } from "react";

function useWebsocketClient({url, workerRef, isWorkerBusy}) {
    const webSocketRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [reconnectCount, setReconnectCount] = useState(0);

    const reconnect = () => {
        console.log('[WEBSOCKET] WebSocket attempting to reconnect')
        setReconnectCount(prev=>(prev+1))
    }

    useEffect(() => {
        webSocketRef.current = new WebSocket(url);
        webSocketRef.current.binaryType = "arraybuffer";
        
        webSocketRef.current.onerror = (error) => {
            console.log('[WEBSOCKET] Websocket failed to connect')
            setConnected(false)
        }

        webSocketRef.current.onopen = () => {
            console.log("[WEBSOCKET] WebSocket connection established");
            setConnected(true)
        }

        webSocketRef.current.onclose = () => {
            console.log("[WEBSOCKET] WebSocket connection closed");
            setConnected(false)
        }

        webSocketRef.current.onmessage = (event) => {
            if(workerRef) { // && !isWorkerBusy.current
                isWorkerBusy.current = true;
                workerRef.current.postMessage({
                    type: 'INSERT', 
                    payload: event.data
                })
            }
        }

        return () => {
            webSocketRef.current.close();
        };
    }, [url, connected, reconnectCount])

    return {webSocketRef, connected, reconnect}
}

export default useWebsocketClient;