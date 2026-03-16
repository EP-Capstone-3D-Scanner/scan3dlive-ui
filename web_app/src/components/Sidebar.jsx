import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import { invalidateCanvas } from './Canvas3D'
import { useEffect , useState, useRef} from 'react';

function EditVolumeSelectionsMenu({sidebarDisplay, setSidebarDisplay, volumeSelections, setVolumeSelections, closeSidebar}) {
        
    const handleAddVolumeSelectionButton = () => {
        const keys = Object.keys(volumeSelections);
        const maxVolumeId = keys.length == 0? 1 : (Math.max(...keys) + 1);
        setVolumeSelections({...volumeSelections, [maxVolumeId]:{name:`Object-${maxVolumeId}`, position:[0, 0, 0], size:[2, 2, 2], rotation:[0, 0, 0], notes:''}})
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
                                
                                <div className="text-light text-start pt-0 flex-grow-1" style={{ fontSize: '0.55em' }}>
                                    <b>Position</b>: ({volumeSelections[volumeId].position.map(n => Math.trunc(n)).join(", ")})<br/>
                                    <b>Size</b>: ({volumeSelections[volumeId].size.map(n => Math.trunc(n)).join(", ")})<br/>
                                    <b>Rotation</b>: ({volumeSelections[volumeId].rotation.map(n => Math.trunc(n)).join(", ")})<br/>
                                </div>
                                
                                <ButtonGroup vertical className="d-flex flex-column me-0 gap-1" style={{ width: '15%' }}>
                                    <Button onClick={() => {handleEditVolumeSelectionButton(volumeId)}} variant="primary" className="text-center p-0" style={{ fontSize: '0.55em'}}>
                                        <img style={{ width: '40%'}} src={`icons\\illustration-icon.svg`}></img>
                                    </Button>
                                    <Button onClick={() => {handleDeleteVolumeSelectionButton(volumeId)}} variant="danger" className="text-center p-0" style={{ fontSize: '0.55em'}}>
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

function UpdateVolumeSelectionMenu({ sidebarDisplay, setSidebarDisplay, volumeSelections, setVolumeSelections }) {
    const volumeId = sidebarDisplay['selectedVolume'];
    const currentVolume = volumeSelections[volumeId];

    const handleCloseVolumeSelectionButton = () => {
        if (sidebarDisplay['selectedVolumeNew']) {
            const { [volumeId]: _, ...rest } = volumeSelections;
            setVolumeSelections(rest);
            setSidebarDisplay({ ...sidebarDisplay, selectedVolume: -1, selectedVolumeNew: false });
        }
        setSidebarDisplay({ ...sidebarDisplay, page: 'EditVolumeSelectionsMenu', selectedVolume: -1 });
        invalidateCanvas();
    };

    const handleDoneVolumeSelectionButton = () => {
        setSidebarDisplay({ ...sidebarDisplay, page: 'EditVolumeSelectionsMenu', selectedVolume: -1 });
        invalidateCanvas();
    };

    // Consolidated handler for Name and Notes
    const handleTextChange = (field, newValue) => {
        setVolumeSelections(prev => ({
            ...prev,
            [volumeId]: { ...prev[volumeId], [field]: newValue }
        }));
    };

    // Allows raw string input for numeric fields (handles ".", "-", and typing)
    const handleNumericChange = (property, axisIndex, newValue) => {
        // Regex allows: empty string, just a minus, just a dot, or valid partial numbers
        if (newValue !== '' && newValue !== '-' && !/^-?\d*\.?\d*$/.test(newValue)) return;

        setVolumeSelections(prev => ({
            ...prev,
            [volumeId]: {
                ...prev[volumeId],
                [property]: prev[volumeId][property].map((val, i) => i === axisIndex ? newValue : val)
            }
        }));
    };

    // Sanitizes values when the user stops typing
    const handleBlur = (property, axisIndex, value) => {
        let parsedVal = parseFloat(value);
        if (isNaN(parsedVal)) parsedVal = 0;

        // Enforce non-negative for size
        if (property === 'size' && parsedVal < 0) parsedVal = 0;

        setVolumeSelections(prev => ({
            ...prev,
            [volumeId]: {
                ...prev[volumeId],
                [property]: prev[volumeId][property].map((coord, i) => 
                    i === axisIndex ? parsedVal : coord
                )
            }
        }));
    };

    // Guard clause in case volumeId is invalid/not found
    if (!currentVolume) return null;

    return (
        <>
            <div className="pb-2">Edit Volume Selection</div>
            <div className="mb-2 pb-1" style={{ 'fontSize': '0.75em' }}>Volume ID: #{volumeId}</div>

            <Form style={{ fontSize: '0.8em', 'overflowX': 'hidden' }} className="d-flex flex-column p-3 flex-grow-1">
                
                {/* Name Input */}
                <Form.Group className="mb-2 d-flex flex-column">
                    <div className="d-flex align-items-center mb-2">
                        <Form.Label className="me-2" htmlFor={'volume-name'} style={{ width: '3em', marginBottom: 0 }}>
                            Name: 
                        </Form.Label>
                        <div className="flex-grow-1">
                            <Form.Control 
                                id={`volume-name`}
                                size="sm" 
                                type="text" 
                                style={{ height: '22px', fontSize: '0.9em' }}
                                value={currentVolume.name} 
                                className="py-0" 
                                onChange={(e) => handleTextChange('name', e.target.value)} 
                            />
                        </div>
                    </div>
                </Form.Group>

                {/* Position Group */}
                <Form.Group className="mb-2 d-flex flex-column border-top p-2" style={{ 'fontSize': '0.9em' }}>
                    <Form.Label className="mb-2 align-self-start"><b>Position: </b></Form.Label>
                    {['x', 'y', 'z'].map((axis, index) => (
                        <div key={`pos-${axis}`} className="d-flex align-items-center mb-2">
                            <Form.Label htmlFor={`pos-${axis}`} style={{ width: '2.5em', marginBottom: 0 }}>
                                {axis}:
                            </Form.Label>
                            <div className="flex-grow-1">
                                <Form.Control 
                                    id={`pos-${axis}`}
                                    size="sm" 
                                    type="text" 
                                    style={{ height: '22px', fontSize: '0.9em' }}
                                    value={currentVolume.position[index]} 
                                    className="py-0" 
                                    onChange={(e) => handleNumericChange('position', index, e.target.value)} 
                                    onBlur={(e) => handleBlur('position', index, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </Form.Group>

                {/* Size Group */}
                <Form.Group className="mb-2 d-flex flex-column border-top p-2" style={{ 'fontSize': '0.9em' }}>
                    <Form.Label className="mb-2 align-self-start"><b>Size: </b></Form.Label>
                    {['x(l)', 'y(w)', 'z(h)'].map((axis, index) => (
                        <div key={`size-${axis}`} className="d-flex align-items-center mb-2">
                            <Form.Label htmlFor={`size-${axis}`} style={{ width: '2.5em', marginBottom: 0 }}>
                                {axis}:
                            </Form.Label>
                            <div className="flex-grow-1">
                                <Form.Control 
                                    id={`size-${axis}`}
                                    size="sm" 
                                    type="text" 
                                    style={{ height: '22px', fontSize: '0.9em' }}
                                    value={currentVolume.size[index]} 
                                    className="py-0" 
                                    onChange={(e) => handleNumericChange('size', index, e.target.value)} 
                                    onBlur={(e) => handleBlur('size', index, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </Form.Group>

                {/* Rotation Group */}
                <Form.Group className="mb-2 d-flex flex-column border-top p-2" style={{ 'fontSize': '0.9em' }}>
                    <Form.Label className="mb-2 align-self-start"><b>Rotation: </b></Form.Label>
                    {['rx', 'ry', 'rz'].map((axis, index) => (
                        <div key={`rot-${axis}`} className="d-flex align-items-center mb-2">
                            <Form.Label htmlFor={`rot-${axis}`} style={{ width: '2.5em', marginBottom: 0 }}>
                                {axis}:
                            </Form.Label>
                            <div className="flex-grow-1">
                                <Form.Control 
                                    id={`rot-${axis}`}
                                    size="sm" 
                                    type="text" 
                                    style={{ height: '22px', fontSize: '0.9em' }}
                                    value={currentVolume.rotation[index]} 
                                    className="py-0" 
                                    onChange={(e) => handleNumericChange('rotation', index, e.target.value)} 
                                    onBlur={(e) => handleBlur('rotation', index, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </Form.Group>

                {/* Notes/Labels */}
                <Form.Group className="mb-2 d-flex flex-column border-top p-2" style={{ 'fontSize': '0.9em' }}>
                    <Form.Label className="mb-2 align-self-start"><b>Labels/Notes: </b></Form.Label>
                    <Form.Control 
                        id={`volume-note`}
                        as="textarea"
                        size="sm" 
                        style={{ height: '100px', fontSize: '0.9em' }}
                        value={currentVolume.notes || ""}
                        placeholder={"Notes..."}
                        className="py-1 text-start" 
                        onChange={(e) => handleTextChange('notes', e.target.value)} 
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
    );
}

function DeletionSelectionMenu({ sidebarDisplay, setSidebarDisplay, deletionSelection, setDeletionSelection, octreeWorkerRef, isWorkerBusy }) {

    const handleCloseDeletionButton = () => {
        setSidebarDisplay({ ...sidebarDisplay, show: false });
        invalidateCanvas();
    };

    const handleDeleteSelectionButton = () => {
        invalidateCanvas();
        if (octreeWorkerRef) {
            isWorkerBusy.current = true;
            octreeWorkerRef.current.postMessage({ type: 'DELETE', payload: { ...deletionSelection } });
        }
    };

    // Generic Change Handler: Allows raw string input so decimals/negatives can be typed
    const handleChange = (property, axisIndex, newValue) => {
        if (newValue !== '' && newValue !== '-' && !/^-?\d*\.?\d*$/.test(newValue)) return;

        setDeletionSelection(prev => ({
            ...prev,
            [property]: prev[property].map((val, i) => i === axisIndex ? newValue : val)
        }));
    };

    const handleBlur = (property, axisIndex, value) => {
        let parsedVal = parseFloat(value);
        
        if (isNaN(parsedVal)) parsedVal = 0;

        if (property === 'size' && parsedVal < 0) {
            parsedVal = 0;
        }

        setDeletionSelection(prev => ({
            ...prev,
            [property]: prev[property].map((coord, i) => 
                i === axisIndex ? parsedVal : coord
            )
        }));
    };

    return (
        <>
            <div className="pb-2">Delete Points</div>

            <Form style={{ fontSize: '0.8em', 'overflowX': 'hidden' }} className="d-flex flex-column p-3 flex-grow-1">

                {/* Position Group */}
                <Form.Group className="mb-2 d-flex flex-column border-top p-2" style={{ 'fontSize': '0.9em' }}>
                    <Form.Label className="mb-2 align-self-start"><b>Position: </b></Form.Label>
                    {['x', 'y', 'z'].map((axis, index) => (
                        <div key={`pos-${axis}`} className="d-flex align-items-center mb-2">
                            <Form.Label htmlFor={`position-${axis}`} style={{ width: '2.5em', marginBottom: 0 }}>
                                {axis}:
                            </Form.Label>
                            <div className="flex-grow-1">
                                <Form.Control 
                                    id={`position-${axis}`}
                                    size="sm" 
                                    type="text" 
                                    style={{ height: '22px', fontSize: '0.9em' }}
                                    value={deletionSelection.position[index]} 
                                    className="py-0" 
                                    onChange={(e) => handleChange('position', index, e.target.value)} 
                                    onBlur={(e) => handleBlur('position', index, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </Form.Group>

                {/* Size Group */}
                <Form.Group className="mb-2 d-flex flex-column border-top p-2" style={{ 'fontSize': '0.9em' }}>
                    <Form.Label className="mb-2 align-self-start"><b>Size: </b></Form.Label>
                    {['x(l)', 'y(w)', 'z(h)'].map((axis, index) => (
                        <div key={`size-${axis}`} className="d-flex align-items-center mb-2">
                            <Form.Label htmlFor={`size-${axis}`} style={{ width: '2.5em', marginBottom: 0 }}>
                                {axis}:
                            </Form.Label>
                            <div className="flex-grow-1">
                                <Form.Control 
                                    id={`size-${axis}`}
                                    size="sm" 
                                    type="text" 
                                    style={{ height: '22px', fontSize: '0.9em' }}
                                    value={deletionSelection.size[index]} 
                                    className="py-0" 
                                    onChange={(e) => handleChange('size', index, e.target.value)} 
                                    onBlur={(e) => handleBlur('size', index, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </Form.Group>

                {/* Rotation Group */}
                <Form.Group className="mb-2 d-flex flex-column border-top p-2" style={{ 'fontSize': '0.9em' }}>
                    <Form.Label className="mb-2 align-self-start"><b>Rotation: </b></Form.Label>
                    {['rx', 'ry', 'rz'].map((axis, index) => (
                        <div key={`rot-${axis}`} className="d-flex align-items-center mb-2">
                            <Form.Label htmlFor={`rotation-${axis}`} style={{ width: '2.5em', marginBottom: 0 }}>
                                {axis}:
                            </Form.Label>
                            <div className="flex-grow-1">
                                <Form.Control 
                                    id={`rotation-${axis}`}
                                    size="sm" 
                                    type="text" 
                                    style={{ height: '22px', fontSize: '0.9em' }}
                                    value={deletionSelection.rotation[index]} 
                                    className="py-0" 
                                    onChange={(e) => handleChange('rotation', index, e.target.value)} 
                                    onBlur={(e) => handleBlur('rotation', index, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </Form.Group>           
            </Form>

            <div className="d-flex flex-column gap-2 mx-3 my-2">
                <Button onClick={handleDeleteSelectionButton} variant="primary" size="sm">
                    Delete
                </Button>
                <Button onClick={handleCloseDeletionButton} variant="danger" size="sm">
                    Cancel
                </Button>
            </div>
        </>
    );
}

function EditViewSelectionsMenu({displaySettings, setDisplaySettings, closeSidebar}) {
    
    // Terrible coding lol. Half of these functions can be combined into one.
    const handleGridSelectCheckbox = () => {
        const checked = displaySettings['gridVisible']
        setDisplaySettings({...displaySettings, 'gridVisible':!checked})
        invalidateCanvas()
    }

    const handleLabelsSelectCheckbox = () => {
        const checked = displaySettings['showLabels']
        console.log(checked)
        setDisplaySettings({...displaySettings, 'showLabels':!checked})
        console.log('ih')
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
                        label="Hide Labels"
                        name="annotationSelectCheckbox"
                        type="checkbox"
                        checked={!displaySettings['showLabels']}
                        onChange={handleLabelsSelectCheckbox}
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

function Sidebar({sidebarDisplay, setSidebarDisplay, volumeSelections, setVolumeSelections, deletionSelection, setDeletionSelection, displaySettings, setDisplaySettings, octreeWorkerRef, isWorkerBusy}) {
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

            {sidebarDisplay['page'] == 'DeletionSelectionMenu' ?             
                <DeletionSelectionMenu
                    sidebarDisplay={sidebarDisplay}
                    setSidebarDisplay={setSidebarDisplay}
                    deletionSelection={deletionSelection}
                    setDeletionSelection={setDeletionSelection}
                    octreeWorkerRef={octreeWorkerRef}
                    isWorkerBusy={isWorkerBusy}
                >    
                </DeletionSelectionMenu>
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
