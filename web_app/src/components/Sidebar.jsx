import React from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import { invalidateCanvas } from './Canvas3D'
import { useEffect } from 'react';

function EditClipSelectionsMenu({clips, setClips, closeSidebar}) {
    return (
        <> 
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

            <div className="d-flex flex-column gap-2 mx-3 my-2">   
                <Button variant="primary" size="sm">Add Clip</Button>
                <Button onClick={closeSidebar} variant="danger" size="sm">Cancel</Button>
            </div> 
        </>
    )
}

function EditViewSelectionsMenu({closeSidebar, displaySettings, setDisplaySettings}) {
    
    // Terrible coding lol. Half of these functions can be combined into one.
    const handleGridSelectCheckbox = () => {
        const checked = displaySettings['gridVisible']
        setDisplaySettings({...displaySettings, 'gridVisible':!checked})
        invalidateCanvas()
    }

    const handleSkyboxSelectCheckbox = () => {
        const checked = displaySettings['skyboxVisible']
        setDisplaySettings({...displaySettings, 'skyboxVisible':!checked})
        invalidateCanvas()
    }

    const handleSkyboxPresetSelection = (event) => {
        const selection = event.target.value;
        setDisplaySettings({...displaySettings, 'skyboxPreset':selection})
        invalidateCanvas()
    }

    const handleOctreeMaxLODRange = (event) => {
        const value = event.target.value;
        setDisplaySettings({...displaySettings, 'octreeMaxLOD':value})
        invalidateCanvas()
    }

    const handleBackgroundSelectCheckbox = () => {
        const checked = displaySettings['backgroundVisible']
        setDisplaySettings({...displaySettings, 'backgroundVisible':!checked})
        invalidateCanvas()
    }

    const handleBackgroundColorControl = (event) => {
        const colorValue = event.target.value;
        console.log(colorValue)
        setDisplaySettings({...displaySettings, 'backgroundColor':colorValue})
        invalidateCanvas()
    }

    return (
        <>
            <div className="mb-2 pb-2">Format Appearance</div>

            <Form style={{'fontSize':'0.8em'}} className="d-flex flex-column mx-3 p-2 flex-grow-1">
                <Form.Group className="d-flex flex-column" controlId="viewSelectGrid">
                    <Form.Label className="mb-3"><b>View</b></Form.Label>
                    
                    <Form.Check
                        className="d-flex flex-row gap-2 my-0"
                        label="Display Grid"
                        name="gridSelectCheckbox"
                        type="checkbox"
                        defaultChecked={true}
                        onChange={handleGridSelectCheckbox}
                    />

                    <div className="d-flex flex-row gap-3 my-1">
                        <Form.Check
                            className="align-items-center d-flex flex-row gap-2"
                            label="Background"
                            name="gridSelectCheckbox"
                            type="checkbox"
                            onChange={handleBackgroundSelectCheckbox}
                        />

                        <Form.Control
                            type="color"
                            size="sm"
                            value={displaySettings['backgroundColor']}
                            title="Choose your color"
                            className="ms-auto form-control-color"
                            onChange={handleBackgroundColorControl} 
                        />
                    </div>

                    <div className="d-flex flex-row gap-3 mt-2">
                        <Form.Check
                            className="align-items-center d-flex flex-row gap-2"
                            label="Skybox"
                            name="gridSelectCheckbox"
                            type="checkbox"
                            checked={displaySettings['skyboxVisible']}
                            onChange={handleSkyboxSelectCheckbox}
                        />

                        <Form.Select 
                            size="sm" 
                            style={{ fontSize: '0.8em' }}
                            onChange={handleSkyboxPresetSelection}
                        >
                            <option value="city">City</option>
                            <option value="dawn">Dawn</option>
                            <option value="night">Night</option>
                            <option value="park">Park</option>
                        </Form.Select>
                    </div>
                </Form.Group> 
                
                <Form.Group 
                    className="d-flex flex-column flex-grow-1 mt-3 border-top pt-1" 
                    controlId="displaySelectGrid"
                >
                    <Form.Label className="mb-2"><b>Display</b></Form.Label>

                    <Form.Check
                        className="d-flex flex-row gap-2 my-1"
                        label="Hide Annotations"
                        name="annotationSelectCheckbox"
                        type="checkbox"
                    />

                    <div className="d-flex flex-row gap-3 my-1">
                        <Form.Label>LOD</Form.Label>
                        <Form.Range
                            defaultValue={1}
                            min={1}
                            max={10}
                            step={1}
                            onChange={handleOctreeMaxLODRange}
                        />
                    </div>
                </Form.Group>  
            </Form>
            
            <div className="d-flex flex-row gap-2 mx-3 my-2">   
                <Button 
                    className="flex-grow-1" 
                    variant="primary" 
                    size="sm"
                    onClick={closeSidebar}
                >
                    Save Changes
                </Button>
            </div> 
        </>
    )
}


function Sidebar({sidebarDisplay, setSidebarDisplay, clips, setClips, displaySettings, setDisplaySettings}) {
    const closeSidebar = () => {
        setSidebarDisplay({...sidebarDisplay, 'show':false});
    }

    return (
        <div 
            id="Sidebar" 
            className={`${sidebarDisplay['show'] ? "" : "close"} bg-dark h-100 border-light position-absolute top-0 text-white d-flex flex-column`}
        >

            {sidebarDisplay['page'] == 'EditSelectionsMenu' ?             
                <EditClipSelectionsMenu
                    clips={clips}
                    setSelectedClips={setClips}
                    closeSidebar={closeSidebar}
                >    
                </EditClipSelectionsMenu>
            : null}

            {sidebarDisplay['page'] == 'EditViewSelectionsMenu' ? 
                <EditViewSelectionsMenu 
                    closeSidebar={closeSidebar}
                    displaySettings={displaySettings}
                    setDisplaySettings={setDisplaySettings}
                >
                </EditViewSelectionsMenu> 
            : null}

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