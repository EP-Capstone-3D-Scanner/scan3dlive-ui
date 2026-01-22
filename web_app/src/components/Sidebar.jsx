import React from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';

function Sidebar({sidebarDisplay, setSidebarDisplay, clips, setClips}) {
    const closeSidebar = () => {
        setSidebarDisplay(false);
    }
    
    return (
        <div 
            id="Sidebar" 
            className={`${sidebarDisplay ? "" : "close"} bg-dark h-100 border-light position-absolute top-0 text-white d-flex flex-column`}
        >
            <div className="mb-2 pb-2">Edit Clip Selections</div>

            <div className="flex-grow-1 overflow-auto">
                <ListGroup 
                    variant="flush" 
                    className="border border-secondary rounded mx-3"
                >
                    {Object.keys(clips).map(clipId => (
                        
                        <ListGroup.Item 
                            key={clipId} 
                            className="border-secondary ps-2 d-flex pe-2"
                            style={{'background-color':'#2e2e2eff'}}
                        >
                            <div className="d-flex flex-row gap-2 w-100">
                                
                                <div className="d-flex flex-column gap-1">
                                    <Badge 
                                        bg="secondary" 
                                        className="px-2 py-0" 
                                        pill
                                    >
                                        <code><small className="text-light">{`ID: ${clipId}`}</small></code>
                                    </Badge>
                                    
                                    <Badge 
                                        bg="warning" 
                                        className="px-2 py-0"
                                    >
                                        <code><small className="text-black-50">{`${clips[clipId].type}`}</small></code>
                                    </Badge>
                                </div>
                                
                                <div 
                                    className="text-light text-start pt-0 flex-grow-1" 
                                    style={{ fontSize: '0.65em' }}
                                >
                                    <b>Position</b>: ({clips[clipId].position.map(n => Math.trunc(n)).join(", ")})<br/>
                                    <b>Rotation</b>: {clips[clipId].rotation}<br/>
                                    <b>Size:</b> {clips[clipId].size}
                                </div>
                                
                                <ButtonGroup 
                                    vertical 
                                    className="d-flex flex-column me-0 gap-1" 
                                    style={{ width: '15%' }}
                                >
                                    <Button
                                        variant="outline-primary"
                                        className="text-center p-0"
                                        style={{ fontSize: '0.55em'}}
                                    >
                                        <img style={{ width: '40%'}} src={`icons\\illustration-icon.svg`}></img>
                                    </Button>
                                    
                                    <Button
                                        variant="outline-danger"
                                        className="text-center p-0"
                                        style={{ fontSize: '0.55em'}}
                                    >
                                        <img style={{ width: '30%'}} src={`icons\\recycle-bin-icon.svg`}></img>
                                    </Button>
                                </ButtonGroup>
                            
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>

            <div 
                className="d-flex flex-column gap-2 mx-3 my-2">   
                <Button variant="primary" size="sm">Add Clip</Button>
                <Button onClick={closeSidebar} variant="danger" size="sm">Cancel</Button>
            </div> 
        </div>
    );
}

export default Sidebar;




{/*<Tabs defaultActiveKey="edit" className="Sidebar-tab mb-3" fill>
<Tab eventKey="info" title="Info">
Point cloud information will go here...
</Tab>
<Tab eventKey="edit" title="Edit">
</Tab>
</Tabs>*/}
    
/*
<ListGroup className="w-100">
{Array.from(annotations.entries()).map(([id, annotation]) => (
<ListGroup.Item key={id} className="Sidebar-annotation-item d-flex me-auto w-100 align-items-center">
{`Object ${annotation.label}`}
{/*<Form.Control size="sm w-50 h-25 bg-dark border-none" type="text" placeholder="Large text" />
</ListGroup.Item>
))}
</ListGroup>
*/