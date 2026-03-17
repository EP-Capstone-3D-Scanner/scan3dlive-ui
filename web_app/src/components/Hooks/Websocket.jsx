import { useState , useEffect , useRef } from "react";

function useWebsocketClient({url, workerRef, isWorkerBusy}) {
    const webSocketRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [reconnectCount, setReconnectCount] = useState(0);

    useEffect(() => {
        webSocketRef.current = new WebSocket(url);
        webSocketRef.current.binaryType = "arraybuffer";
        
        webSocketRef.current.onerror = (error) => {
            console.log('Websocket failed to connect')
            setConnected(false)
        }

        webSocketRef.current.onopen = () => {
            console.log("WebSocket connection established");
            setConnected(true)
        }

        webSocketRef.current.onclose = () => {
            console.log("WebSocket connection closed");
            setConnected(false)
        }

        webSocketRef.current.onmessage = (event) => {
            if(workerRef) { // && !isWorkerBusy.current
                isWorkerBusy.current = true;
                workerRef.current.postMessage({type: 'INSERT', payload: event.data})
            }
        }

        return () => {
            webSocketRef.current.close();
        };
    }, [url, connected, reconnectCount])

    return {webSocketRef, connected, setReconnectCount}
}

export default useWebsocketClient;