import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useContext } from 'react';
import { AppContext } from '../Contexts/Contexts';
import { invalidateCanvas } from '../Canvas3D'


function UpdateVolumeSelectionMenu() {
    
    const {
        sidebarDisplay, 
        setSidebarDisplay, 
        volumeSelections, 
        setVolumeSelections, 
        userHistory
    } = useContext(AppContext)

    const handleCloseVolumeSelectionButton = () => {
        userHistory.pushUndoStack()
        if(sidebarDisplay.selectedVolumeNew) {
            const { [sidebarDisplay.selectedVolume]: _ , ...rest } = volumeSelections;
            setVolumeSelections(rest);
            setSidebarDisplay({
                ...sidebarDisplay, 
                selectedVolume:-1, 
                selectedVolumeNew:false
            })
        }
        setSidebarDisplay({
            ...sidebarDisplay, 
            page:'EditVolumeSelectionsMenu', 
            selectedVolume:-1
        })
        invalidateCanvas()
    }

    const handleDoneVolumeSelectionButton = () => {
        userHistory.pushUndoStack()
        setSidebarDisplay({
            ...sidebarDisplay, 
            page:'EditVolumeSelectionsMenu', 
            selectedVolume:-1
        })
        invalidateCanvas()
    }

    const handleNameChange = (newValue) => {
        const volumeId = sidebarDisplay.selectedVolume;
        setVolumeSelections(prev => ({
            ...prev,
            [volumeId]: {
                ...prev[volumeId],
                name:newValue 
            }
        }));
    }

    const handleNotesChange = (newValue) => {
        const volumeId = sidebarDisplay.selectedVolume;
        setVolumeSelections(prev => ({
            ...prev,
            [volumeId]: {
                ...prev[volumeId],
                notes:newValue 
            }
        }));
    }

    const handlePositionChange = (axisIndex, newValue) => {
        userHistory.pushUndoStack()
        const val = parseFloat(newValue)||newValue; 
        const volumeId = sidebarDisplay.selectedVolume;

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
        userHistory.pushUndoStack()
        let val = parseFloat(newValue)||newValue; 
        if(parseFloat(val) && val < 0) {
            val = 0;
        }
        const volumeId = sidebarDisplay.selectedVolume;

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
        userHistory.pushUndoStack()
        let val = parseFloat(newValue)||0; 
        const volumeId = sidebarDisplay.selectedVolume;
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
            <div className="mb-2 pb-1" style={{'fontSize':'0.75em'}}>Volume ID: #{sidebarDisplay.selectedVolume}</div>

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
                                value={volumeSelections[sidebarDisplay.selectedVolume].name} 
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
                                    value={volumeSelections[sidebarDisplay.selectedVolume].position[index]} 
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
                                    value={volumeSelections[sidebarDisplay.selectedVolume].size[index]} 
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
                        value={volumeSelections[sidebarDisplay.selectedVolume].notes}
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
                {sidebarDisplay.selectedVolumeNew && (
                    <Button onClick={handleCloseVolumeSelectionButton} variant="danger" size="sm">
                        Cancel
                    </Button>
                )}
            </div>
        </>
    )
}

export default UpdateVolumeSelectionMenu;