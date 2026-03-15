import React from 'react';
import { useRef } from 'react'
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Nav from 'react-bootstrap/Nav';
import { invalidateCanvas } from './Canvas3D'


const Navigator = ({ websocketRef , octreeWorkerRef, displaySettings, setDisplaySettings, sidebarDisplay, setSidebarDisplay}) => {

    const handleFormatButtonClick = () => {
        setSidebarDisplay(prev => ({...prev, page:'EditViewSelectionsMenu', show:true, 'showDeletionSelection':false}));
    }

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } 
        else {
            document.exitFullscreen();
        }
    };

    const loadUserPLYFile = (e) => {
        const file = e.target.files[0];
        if(file) {
            octreeWorkerRef.current.postMessage({ type: 'LOAD', payload: { file } })
        }
        e.target.value = null;
    }

    const saveUserPLYFile = (e) => {
        octreeWorkerRef.current.postMessage({ type: 'SAVE', payload: {} })
    }

    const handleSettingsButtonClick = () => {
        setDisplaySettings(prev=>({...prev, 'visibleModal':'settings'}))
    }

    const handleInfoButtonClick = () => {
        setDisplaySettings(prev=>({...prev, 'visibleModal':'details'}))
    }

    const handleCloseButtonClick = (e) => {
        octreeWorkerRef.current.postMessage({ type: 'CLEAR', payload: {} })
    }

    const handleGridSelectCheckbox = () => {
        const checked = displaySettings['gridVisible']
        setDisplaySettings({...displaySettings, 'gridVisible':!checked})
        invalidateCanvas()
    }

    const handleLabelsSelectCheckbox = () => {
        const checked = displaySettings['showLabels']
        setDisplaySettings({...displaySettings, 'showLabels':!checked})
        invalidateCanvas()
    }

    const handleConnectScanner = (e) => {
        const refreshCount = sidebarDisplay['scannerReconnecting'] + 1;
        console.log('attempting to reconnect')
        setSidebarDisplay((prev) => ({...prev, "scannerReconnecting":refreshCount}))
    }

    const handleStartScanner = (e) => {
        console.log(websocketRef.current)
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify({ 
                type: 'COMMAND', 
                action: 'start_scanner' 
            }));
        }
    };

    const handleStopScanner = (e) => {
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify({ 
                type: 'COMMAND', 
                action: 'stop_scanner' 
            }));
        }
    };

    return (
        <Navbar collapseOnSelect id="Navigator" bg="dark" variant="dark" className="w-100 ps-1 pt-0 pe-0 pb-0 d-flex align-items-center">
            <Navbar.Collapse className="h-100 d-flex align-items-center">
                <Nav className="h-100 w-100 p-0 d-flex flex-row align-items-center">
                    
                    <NavDropdown title="File" className="h-100 d-flex align-items-center">
                        <NavDropdown.Item>New</NavDropdown.Item>
                        <NavDropdown.Item 
                            as="label" 
                            htmlFor="file-upload" 
                            style={{ cursor: 'pointer', margin: 0, display: 'block' }}
                        >
                            Open
                            <input
                                id="file-upload"
                                type="file"
                                onChange={loadUserPLYFile}
                                accept=".ply"
                                style={{
                                    position: 'absolute',
                                    width: '1px',
                                    height: '1px',
                                    padding: '0',
                                    margin: '-1px',
                                    overflow: 'hidden',
                                    clip: 'rect(0, 0, 0, 0)',
                                    border: '0',
                                }}
                            />
                        </NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Save</NavDropdown.Item>
                        <NavDropdown.Item onClick={saveUserPLYFile}>Save As...</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item onClick={handleSettingsButtonClick}>Settings</NavDropdown.Item>
                        <NavDropdown.Item onClick={handleInfoButtonClick}>Info</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item onClick={handleCloseButtonClick}>Close</NavDropdown.Item>
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
                        <NavDropdown.Item onClick={handleFormatButtonClick}>Format</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item onClick={handleGridSelectCheckbox}>Grid</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item onClick={handleLabelsSelectCheckbox}>Labels</NavDropdown.Item>
                        <NavDropdown.Item onClick={toggleFullScreen}>Fullscreen</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Appearance</NavDropdown.Item>
                    </NavDropdown>

                    <NavDropdown title="Network" className="h-100 d-flex align-items-center">
                        <NavDropdown.Item onClick={handleConnectScanner}>Connect to Scanner</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item onClick={handleStartScanner}>Start Scanner</NavDropdown.Item>
                        <NavDropdown.Item onClick={handleStopScanner}>Stop Scanner</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
                <Badge className={`me-2 scanner-badge-${sidebarDisplay.scannerOnline ? "online" : "offline"}`}>
                    {sidebarDisplay.scannerOnline ? "Scanner Online" : "Scanner Offline"}
                </Badge>
            </Navbar.Collapse>
        </Navbar> 
    )
};

export default Navigator;