import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Nav from 'react-bootstrap/Nav';
import { useContext , useCallback } from 'react'
import { invalidateCanvas } from './Canvas3D'
import { AppContext } from './Contexts/Contexts';

const HIDDEN_INPUT_STYLE = {
    position: 'absolute', width: '1px', height: '1px', padding: '0',
    margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0',
};

const Navigator = () => {

    const { 
        websocketRef , 
        octreeWorkerRef, 
        displaySettings, 
        setDisplaySettings, 
        sidebarDisplay,
        setSidebarDisplay,
        connected,
        setReconnectCount,
    } = useContext(AppContext)

    const sendWSMessage = useCallback((action) => {
        const ws = websocketRef.current;
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'COMMAND', action }));
        }
    }, [websocketRef]);

    const handleFileLoad = (e) => {
        const file = e.target.files[0];
        if(file) octreeWorkerRef.current.postMessage({ type: 'LOAD', payload: { file } })
        e.target.value = null;
    }

    const handleFormat = () => {
        setSidebarDisplay(
            prev => ({
                ...prev, 
                page:'EditViewSelectionsMenu', 
                show:true, 
                showDeletionSelection:false
            })
        );
    }

    const handleFileSave = (e) => {
        octreeWorkerRef.current.postMessage({ 
            type: 'SAVE', 
            payload: displaySettings.projectName
        })
    }

    const handleConnectScanner = (e) => {
        console.log('attempting to reconnect')
        setReconnectCount(prev=>(prev+1))
    }

    const handleClose = (e) => {
        octreeWorkerRef.current.postMessage({ 
            type: 'CLEAR', 
            payload: {} 
        })
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } 
        else {
            document.exitFullscreen();
        }
    };

    const updateModal = (modalName) => {
        setDisplaySettings(
            prev => ({ 
                ...prev, 
                visibleModal: modalName 
            })
        )
    }

    const toggleSetting = (key) => {
        setDisplaySettings(
            prev => ({ 
                ...prev, 
                [key]: !prev[key] 
            })
        );
        invalidateCanvas();
    };

    return (
        <Navbar 
            collapseOnSelect 
            id="Navigator" 
            bg="dark" 
            variant="dark" 
            className="w-100 ps-1 pt-0 pe-0 pb-0 d-flex align-items-center">
            
            <Navbar.Collapse className="h-100 d-flex align-items-center">
                <Nav className="h-100 w-100 p-0 d-flex flex-row align-items-center">
                    
                    <NavDropdown title="File" className="h-100 d-flex align-items-center">
                        <NavDropdown.Item>New</NavDropdown.Item>
                        <NavDropdown.Item as="label" htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                            Open
                            <input 
                                id="file-upload" 
                                type="file" 
                                onChange={handleFileLoad} 
                                accept=".ply" 
                                style={HIDDEN_INPUT_STYLE} 
                            />
                        </NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item onClick={handleFileSave}>Save</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => updateModal('save_as')}>Save As...</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item onClick={() => updateModal('settings')}>Settings</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => updateModal('details')}>Info</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item onClick={handleClose}>Close</NavDropdown.Item>
                    </NavDropdown>

                    <NavDropdown title="Edit" className="h-100 d-flex align-items-center">
                        <NavDropdown.Item>Undo</NavDropdown.Item>
                        <NavDropdown.Item>Redo</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Cut</NavDropdown.Item>
                        <NavDropdown.Item>Copy</NavDropdown.Item>
                        <NavDropdown.Item>Paste</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Segment</NavDropdown.Item>
                    </NavDropdown>

                    <NavDropdown title="View" className="h-100 d-flex align-items-center">
                        <NavDropdown.Item onClick={handleFormat}>Format</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item onClick={() => toggleSetting('gridVisible')}>Grid</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item onClick={() => toggleSetting('showLabels')}>Labels</NavDropdown.Item>
                        <NavDropdown.Item onClick={toggleFullscreen}>Fullscreen</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Appearance</NavDropdown.Item>
                    </NavDropdown>

                    <NavDropdown title="Network" className="h-100 d-flex align-items-center">
                        <NavDropdown.Item onClick={handleConnectScanner}>Connect to Scanner</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item onClick={() => sendWSMessage('start_scanner')}>Start Scanner</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => sendWSMessage('stop_scanner')}>Stop Scanner</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
                <Badge className={`me-2 scanner-badge-${connected ? "online" : "offline"}`}>
                    {connected ? "Scanner Online" : "Scanner Offline"}
                </Badge>
            </Navbar.Collapse>
        </Navbar> 
    )
};

export default Navigator;