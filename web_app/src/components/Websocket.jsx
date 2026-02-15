import { useEffect } from "react";

function useWebsocketClient({url, setSidebarDisplay}) {;
    useEffect(() =>{
        const ws = new WebSocket(url);
        ws.onopen = () => {
            console.log("WebSocket connection established");
            setSidebarDisplay(prev => ({...prev, scannerOnline: true}));
        }
        ws.onclose = () => {
            console.log("WebSocket connection closed");
            setSidebarDisplay(prev => ({...prev, scannerOnline: false}));
        }
        ws.onmessage = (event) => {
            console.log("Received message:", event);
        }

        return () => {
            ws.close();
        };
    }, [url])
}

export default useWebsocketClient;