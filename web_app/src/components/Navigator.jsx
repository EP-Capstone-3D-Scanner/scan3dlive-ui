import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Nav from 'react-bootstrap/Nav';

const Navigator = ({sidebarDisplay, setSidebarDisplay}) => {
{/*<Navbar.Brand className = "ms-0"> <p class="h3 fw-bold text-white">Point Cloud Viewer</p></Navbar.Brand>*/}   
    return (
        <Navbar id="Navigator" bg="dark" variant="dark" expand="lg" className="w-100 p-0 d-flex align-items-center">
            <Navbar.Collapse className="me-auto h-100 p-0 d-flex align-items-center">
                <Nav className="me-auto h-100 p-0 d-flex align-items-center">
                    <NavDropdown title="File" className="me-auto h-100 d-flex align-items-center">
                        <NavDropdown.Item>New</NavDropdown.Item>
                        <NavDropdown.Item>Open</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Save</NavDropdown.Item>
                        <NavDropdown.Item>Save As...</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Settings</NavDropdown.Item>
                        <NavDropdown.Item>Info</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Close</NavDropdown.Item>
                    </NavDropdown>

                    <NavDropdown title="Edit" className="me-auto h-100 d-flex align-items-center">
                        <NavDropdown.Item>Undo</NavDropdown.Item>
                        <NavDropdown.Item>Redo</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Cut</NavDropdown.Item>
                        <NavDropdown.Item>Copy</NavDropdown.Item>
                        <NavDropdown.Item>Paste</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Segment</NavDropdown.Item>
                    </NavDropdown>

                    <NavDropdown title="View" className="me-auto h-100 d-flex align-items-center">
                        <NavDropdown.Item>Format</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Grid</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Labels</NavDropdown.Item>
                        <NavDropdown.Item>Fullscreen</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Appearance</NavDropdown.Item>
                    </NavDropdown>

                    <NavDropdown title="Network" className="me-auto h-100 d-flex align-items-center">
                        <NavDropdown.Item>Connect to Scanner</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>Start Scanner</NavDropdown.Item>
                        <NavDropdown.Item>Stop Scanner</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Navbar.Collapse>
            
            <button className="Sidebar-toggle-button ms-auto" onClick={()=>{setSidebarDisplay(!sidebarDisplay);}}>
            ◥ 
            </button>
        </Navbar> 
    )
};

export default Navigator;