import React from 'react';
import { useRef } from 'react'
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Nav from 'react-bootstrap/Nav';
import { invalidateCanvas } from './Canvas3D'


const Navigator = ({ octreeWorkerRef, displaySettings, setDisplaySettings, sidebarDisplay, setSidebarDisplay}) => {

    const handleFormatButtonClick = () => {
        setSidebarDisplay(prev => ({...prev, page:'EditViewSelectionsMenu', show:true}));
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
        e.stopPropagation()
        const file = e.target.files[0];
        if(file) {
            octreeWorkerRef.current.postMessage({ type: 'LOAD', payload: { file } })
        }
    }

    const handleGridSelectCheckbox = () => {
        const checked = displaySettings['gridVisible']
        setDisplaySettings({...displaySettings, 'gridVisible':!checked})
        invalidateCanvas()
    }

    return (
        <Navbar id="Navigator" bg="dark" variant="dark" expand={true} className="w-100 ps-1 pt-0 pe-0 pb-0 d-flex align-items-center">
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
                        <NavDropdown.Item>Save As...</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Settings</NavDropdown.Item>
                        <NavDropdown.Item>Info</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Close</NavDropdown.Item>
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
                        <NavDropdown.Item>Labels</NavDropdown.Item>
                        <NavDropdown.Item onClick={toggleFullScreen}>Fullscreen</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Appearance</NavDropdown.Item>
                    </NavDropdown>

                    <NavDropdown title="Network" className="h-100 d-flex align-items-center">
                        <NavDropdown.Item>Connect to Scanner</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Start Scanner</NavDropdown.Item>
                        <NavDropdown.Item>Stop Scanner</NavDropdown.Item>
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