import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { invalidateCanvas } from '../Canvas3D'
import { useContext } from 'react';
import { AppContext } from '../Contexts/Contexts';

function DeletionSelectionMenu() {
    
    const {
        sidebarDisplay, 
        setSidebarDisplay,
        deletionSelection,
        setDeletionSelection,
        octreeWorkerRef,
        isWorkerBusy,
        userHistory
    } = useContext(AppContext)

    const handleCloseDeletionButton = () => {
        userHistory.pushUndoStack()
        setSidebarDisplay({
            ...sidebarDisplay, 
            show:false
        })
        invalidateCanvas()
    }

    const handleDeleteSelectionButton = () => {
        invalidateCanvas()
        if(octreeWorkerRef) {
            isWorkerBusy.current = true;
            octreeWorkerRef.current.postMessage({
                type: 'DELETE', 
                payload: {...deletionSelection}
            })
        }
    }

    const handlePositionChange = (axisIndex, newValue) => {
        userHistory.pushUndoStack()
        const val = parseFloat(newValue)||newValue; 

        setDeletionSelection(prev => ({
            ...prev,
            position: position.map((coord, i) => 
                i === axisIndex ? val : coord
            )
        }));
    };

    const handleSizeChange = (axisIndex, newValue) => {
        userHistory.pushUndoStack()
        let val = parseFloat(newValue)||newValue; 
        if(parseFloat(val) && val < 0) {
            val = 0;
        }
        setDeletionSelection(prev => ({
            ...prev,
            size: size.map((coord, i) => 
                i === axisIndex ? val : coord
            )
        }));
    };

    const handleBlur = (property, axisIndex, newValue) => {
        userHistory.pushUndoStack()
        let val = parseFloat(newValue)||0; 
        
        if(property == 'size') {
            val = val>=0 && val
        }

        setDeletionSelection(prev => ({
            ...prev,
            property: prev.position.map((coord, i) => 
                i === axisIndex ? val : coord
            )
        }));
    };

    return (
        <>
            <div className="pb-2">Delete Points</div>

            <Form style={{ fontSize: '0.8em', 'overflowX':'hidden'}} className="d-flex flex-column p-3 flex-grow-1">

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
                                    value={deletionSelection.position[index]} 
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
                                    value={deletionSelection.size[index]} 
                                    className="py-0" 
                                    onChange={(e) => handleSizeChange(index, e.target.value)} 
                                    onBlur={(e) => handleBlur('size', index, e.target.value)}
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
    )
}

export default DeletionSelectionMenu;