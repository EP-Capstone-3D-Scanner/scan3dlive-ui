import React from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import { invalidateCanvas } from './Canvas3D'
import { useEffect , useState, useRef} from 'react';
import { TextureUtils } from 'three';

function EditVolumeSelectionsMenu({sidebarDisplay, setSidebarDisplay, volumeSelections, setVolumeSelections, closeSidebar}) {
        
    const handleAddVolumeSelectionButton = () => {
        const keys = Object.keys(volumeSelections);
        const maxVolumeId = keys.length == 0? 1 : (Math.max(...keys) + 1);
        setVolumeSelections({...volumeSelections, [maxVolumeId]:{name:`Object-${maxVolumeId}`, position:[0, 0, 0], size:[2, 2, 2], notes:''}})
        setSidebarDisplay({...sidebarDisplay, 'selectedVolume':[maxVolumeId], 'page':'UpdateVolumeSelectionMenu', 'selectedVolumeNew':true})
        invalidateCanvas()
    }
    const handleEditVolumeSelectionButton = (volumeId) => {
        setSidebarDisplay({...sidebarDisplay, 'selectedVolume':[volumeId], 'page':'UpdateVolumeSelectionMenu', 'selectedVolumeNew':false})
    }

    const handleDeleteVolumeSelectionButton = (volumeId) => {
        const { [volumeId]: _ , ...rest } = volumeSelections;
        setVolumeSelections(rest);
        setSidebarDisplay({...sidebarDisplay, selectedVolume:-1, selectedVolumeNew:false})
        setSidebarDisplay({...sidebarDisplay, page:'EditVolumeSelectionsMenu', selectedVolume:-1})
        invalidateCanvas()
    }

    return (
        <> 
            <div className="mb-2 pb-2">Edit Volume Selections</div>

            <div className="flex-grow-1 overflow-auto">
                <ListGroup variant="flush" className={`rounded mx-3`}>
                    {Object.keys(volumeSelections).map(volumeId => (
                        
                        <ListGroup.Item key={volumeId} 
                            className="border-secondary ps-2 d-flex pe-2"
                            style={{'background-color':'#2e2e2eff'}}
                        >
                            <div className="d-flex flex-row gap-2 w-100"> 
                                <div className="d-flex flex-column gap-1">
                                    <Badge bg="secondary" className="px-2 py-0" pill>
                                        <code><small className="text-light">{`ID: ${volumeId}`}</small></code>
                                    </Badge>
            
                                    <Badge bg="warning" className="px-2 py-0">
                                        <code><small className="text-black-50">{`${volumeSelections[volumeId].name}`}</small></code>
                                    </Badge>
                                </div>
                                
                                <div className="text-light text-start pt-0 flex-grow-1" style={{ fontSize: '0.65em' }}>
                                    <b>Position</b>: ({volumeSelections[volumeId].position.map(n => Math.trunc(n)).join(", ")})<br/>
                                    <b>Size</b>: ({volumeSelections[volumeId].size.map(n => Math.trunc(n)).join(", ")})<br/>
                                </div>
                                
                                <ButtonGroup vertical className="d-flex flex-column me-0 gap-1" style={{ width: '15%' }}>
                                    <Button onClick={() => {handleEditVolumeSelectionButton(volumeId)}} variant="outline-primary" className="text-center p-0" style={{ fontSize: '0.55em'}}>
                                        <img style={{ width: '40%'}} src={`icons\\illustration-icon.svg`}></img>
                                    </Button>
                                    <Button onClick={() => {handleDeleteVolumeSelectionButton(volumeId)}} variant="outline-danger" className="text-center p-0" style={{ fontSize: '0.55em'}}>
                                        <img style={{ width: '30%'}} src={`icons\\recycle-bin-icon.svg`}></img>
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>

            <div className="d-flex flex-column gap-2 mx-3 my-2">   
                <Button onClick={handleAddVolumeSelectionButton} variant="primary" size="sm">Add Volume Selection</Button>
                <Button onClick={closeSidebar} variant="danger" size="sm">Cancel</Button>
            </div> 
        </>
    )
}

function UpdateVolumeSelectionMenu({sidebarDisplay, setSidebarDisplay, volumeSelections, setVolumeSelections}) {

    const handleCloseVolumeSelectionButton = () => {
        if(sidebarDisplay['selectedVolumeNew']) {
            const { [sidebarDisplay['selectedVolume']]: _ , ...rest } = volumeSelections;
            setVolumeSelections(rest);
            setSidebarDisplay({...sidebarDisplay, selectedVolume:-1, selectedVolumeNew:false})
        }
        setSidebarDisplay({...sidebarDisplay, page:'EditVolumeSelectionsMenu', selectedVolume:-1})
        invalidateCanvas()
    }

    const handleDoneVolumeSelectionButton = () => {
        setSidebarDisplay({...sidebarDisplay, page:'EditVolumeSelectionsMenu', selectedVolume:-1})
        invalidateCanvas()
    }

    const handleNameChange = (newValue) => {
        const volumeId = sidebarDisplay['selectedVolume'];
        setVolumeSelections(prev => ({
            ...prev,
            [volumeId]: {
                ...prev[volumeId],
                name:newValue 
            }
        }));
    }

    const handleNotesChange = (newValue) => {
        const volumeId = sidebarDisplay['selectedVolume'];
        setVolumeSelections(prev => ({
            ...prev,
            [volumeId]: {
                ...prev[volumeId],
                notes:newValue 
            }
        }));
    }

    const handlePositionChange = (axisIndex, newValue) => {
        const val = parseFloat(newValue)||newValue; 
        const volumeId = sidebarDisplay['selectedVolume'];

        setVolumeSelections(prev => ({
            ...prev,
            [volumeId]: {
                ...prev[volumeId],
                position: prev[volumeId].position.map((coord, i) => 
                    i === axisIndex ? val : coord
            )}
        }));
    };

    const handleSizeChange = (axisIndex, newValue) => {
        let val = parseFloat(newValue)||newValue; 
        if(parseFloat(val) && val < 0) {
            val = 0;
        }
        const volumeId = sidebarDisplay['selectedVolume'];

        setVolumeSelections(prev => ({
            ...prev,
            [volumeId]: {
                ...prev[volumeId],
                size: prev[volumeId].size.map((coord, i) => 
                    i === axisIndex ? val : coord
            )}
        }));
    };

    const handleBlur = (property, axisIndex, newValue) => {
        let val = parseFloat(newValue)||0; 
        const volumeId = sidebarDisplay['selectedVolume'];
        if(property == 'size') {
            val = val>=0 && val
        }

        setVolumeSelections(prev => ({
            ...prev,
            [volumeId]: {
                ...prev[volumeId],
                property: prev[volumeId].position.map((coord, i) => 
                    i === axisIndex ? val : coord
            )}
        }));
    };

    return (
        <>
            <div className="pb-2">Edit Volume Selection</div>
            <div className="mb-2 pb-1" style={{'fontSize':'0.75em'}}>Volume ID: #{sidebarDisplay['selectedVolume']}</div>

            <Form style={{ fontSize: '0.8em', 'overflowX':'hidden'}} className="d-flex flex-column p-3 flex-grow-1">
                <Form.Group className="mb-2 d-flex flex-column">
                    <div className="d-flex align-items-center mb-2">
                        <Form.Label className="me-2" htmlFor={'volume-selection-name'} style={{ width: '3em', marginBottom: 0 }}>
                            Name: 
                        </Form.Label>
                        <div className="flex-grow-1">
                            <Form.Control 
                                id={`volume-name`}
                                size="sm" 
                                type="text" 
                                style={{ height: '22px', fontSize: '0.9em' }}
                                value={volumeSelections[sidebarDisplay['selectedVolume']].name} 
                                className="py-0" 
                                onChange={(e) => handleNameChange(e.target.value)} 
                            />
                        </div>
                    </div>
                </Form.Group>

                <Form.Group className="mb-2 d-flex flex-column border-top p-2" style={{'fontSize':'0.9em'}}>
                    <Form.Label className="mb-2 align-self-start"><b>Position: </b></Form.Label>
                    {['x', 'y', 'z'].map((axis, index) => (
                        <div key={axis} className="d-flex align-items-center mb-2">
                            <Form.Label htmlFor={`position-${axis}`} style={{ width: '2.5em', marginBottom: 0 }}>
                                {axis}:
                            </Form.Label>
                            <div className="flex-grow-1">
                                <Form.Control 
                                    id={`position-${axis}`}
                                    size="sm" 
                                    type="text" 
                                    style={{ height: '22px', fontSize: '0.9em' }}
                                    value={volumeSelections[sidebarDisplay['selectedVolume']].position[index]} 
                                    className="py-0" 
                                    onChange={(e) => handlePositionChange(index, e.target.value)} 
                                    onBlur={(e) => handleBlur('position', index, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </Form.Group>

                <Form.Group className="mb-2 d-flex flex-column border-top p-2" style={{'fontSize':'0.9em'}}>
                    <Form.Label className="mb-2 align-self-start"><b>Size: </b></Form.Label>
                    
                    {['x(l)', 'y(w)', 'z(h)'].map((axis, index) => (
                        <div key={axis} className="d-flex align-items-center mb-2">
                            <Form.Label htmlFor={`position-${axis}`} style={{ width: '2.5em', marginBottom: 0 }}>
                                {axis}:
                            </Form.Label>
                            <div className="flex-grow-1">
                                <Form.Control 
                                    id={`position-${axis}`}
                                    size="sm" 
                                    type="text" 
                                    style={{ height: '22px', fontSize: '0.9em' }}
                                    value={volumeSelections[sidebarDisplay['selectedVolume']].size[index]} 
                                    className="py-0" 
                                    onChange={(e) => handleSizeChange(index, e.target.value)} 
                                    onBlur={(e) => handleBlur('size', index, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </Form.Group>

                <Form.Group className="mb-2 d-flex flex-column border-top p-2" style={{'fontSize':'0.9em'}}>
                    <Form.Label className="mb-2 align-self-start"><b>Labels: </b></Form.Label>
                </Form.Group>

                <Form.Group className="mb-2 border-top p-2">
                    <Form.Control 
                        id={`volume-note`}
                        as="textarea"
                        size="sm" 
                        type="text" 
                        style={{ height: '100px', fontSize: '0.9em' }}
                        value={volumeSelections[sidebarDisplay['selectedVolume']].notes}
                        placeholder={"Notes..."}
                        className="py-0 text-start" 
                        onChange={(e) => handleNotesChange(e.target.value)} 
                    />
                </Form.Group>                
            </Form>

            <div className="d-flex flex-column gap-2 mx-3 my-2">
                <Button onClick={handleDoneVolumeSelectionButton} variant="primary" size="sm">
                    Done
                </Button>
                {sidebarDisplay['selectedVolumeNew'] && (
                    <Button onClick={handleCloseVolumeSelectionButton} variant="danger" size="sm">
                        Cancel
                    </Button>
                )}
            </div>
        </>
    )
}

function EditViewSelectionsMenu({displaySettings, setDisplaySettings, closeSidebar}) {
    
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
                        checked={displaySettings['gridVisible']}
                        onChange={handleGridSelectCheckbox}
                    />

                    <div className="d-flex flex-row gap-3 my-1">
                        <Form.Check
                            className="align-items-center d-flex flex-row gap-2"
                            label="Background"
                            name="gridSelectCheckbox"
                            type="checkbox"
                            checked={displaySettings['backgroundVisible']}
                            onChange={handleBackgroundSelectCheckbox}
                        />

                        <Form.Control
                            type="color"
                            size="sm"
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
                            defaultValue={displaySettings['octreeMaxLOD']}
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

function Sidebar({sidebarDisplay, setSidebarDisplay, volumeSelections, setVolumeSelections, displaySettings, setDisplaySettings}) {
    const closeSidebar = () => {
        setSidebarDisplay({...sidebarDisplay, 'show':false});
    }

    return (
        <div 
            id="Sidebar"
            style={{ zIndex: 99999999 }} 
            className={`${sidebarDisplay['show'] ? "" : "close"} bg-dark h-100 border-light position-absolute top-0 text-white d-flex flex-column`}
        >

            {sidebarDisplay['page'] == 'EditVolumeSelectionsMenu' ?             
                <EditVolumeSelectionsMenu
                    sidebarDisplay={sidebarDisplay}
                    setSidebarDisplay={setSidebarDisplay}
                    volumeSelections={volumeSelections}
                    setVolumeSelections={setVolumeSelections}
                    closeSidebar={closeSidebar}
                >    
                </EditVolumeSelectionsMenu>
            : null}

            {sidebarDisplay['page'] == 'EditViewSelectionsMenu' ? 
                <EditViewSelectionsMenu 
                    closeSidebar={closeSidebar}
                    displaySettings={displaySettings}
                    setDisplaySettings={setDisplaySettings}
                >
                </EditViewSelectionsMenu> 
            : null}

            {sidebarDisplay['page'] == 'UpdateVolumeSelectionMenu' ?             
                <UpdateVolumeSelectionMenu
                    sidebarDisplay={sidebarDisplay}
                    setSidebarDisplay={setSidebarDisplay}
                    volumeSelections={volumeSelections}
                    setVolumeSelections={setVolumeSelections}
                >    
                </UpdateVolumeSelectionMenu>
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
