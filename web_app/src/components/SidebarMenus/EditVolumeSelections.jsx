import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { invalidateCanvas } from '../Canvas3D'
import { useContext } from 'react';
import { AppContext } from '../Contexts/Contexts';

export function EditVolumeSelectionsMenu() {
        
    const {
        sidebarDisplay, 
        setSidebarDisplay, 
        volumeSelections, 
        setVolumeSelections, 
        userHistory
    } = useContext(AppContext)

    const closeSidebar = () => {
        userHistory.pushUndoStack()
        setSidebarDisplay({
            ...sidebarDisplay, 
            show:false
        });
    }

    const handleAddVolumeSelectionButton = () => {
        const keys = Object.keys(volumeSelections);
        const maxVolumeId = keys.length == 0? 1 : (Math.max(...keys) + 1);
        userHistory.pushUndoStack()
        setVolumeSelections({
            ...volumeSelections, 
            [maxVolumeId]:{
                name:`Object-${maxVolumeId}`, 
                position:[0, 0, 0], 
                size:[2, 2, 2], 
                notes:''
            }
        })
        setSidebarDisplay({
            ...sidebarDisplay, 
            selectedVolume:[maxVolumeId], 
            page:'UpdateVolumeSelectionMenu', 
            selectedVolumeNew:true
        })
        invalidateCanvas()
    }

    const handleEditVolumeSelectionButton = (volumeId) => {
        userHistory.pushUndoStack()
        setSidebarDisplay({
            ...sidebarDisplay, 
            selectedVolume:[volumeId], 
            page:'UpdateVolumeSelectionMenu', 
            selectedVolumeNew:false
        })
    }

    const handleDeleteVolumeSelectionButton = (volumeId) => {
        const { [volumeId]: _ , ...rest } = volumeSelections;
        userHistory.pushUndoStack()
        setVolumeSelections(rest);
        setSidebarDisplay({
            ...sidebarDisplay, 
            selectedVolume:-1, 
            selectedVolumeNew:false
        })
        setSidebarDisplay({
            ...sidebarDisplay, 
            page:'EditVolumeSelectionsMenu', 
            selectedVolume:-1
        })
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
                                
                                <ButtonGroup 
                                    vertical 
                                    className="d-flex flex-column me-0 gap-1" 
                                    style={{ width: '15%' }}
                                >
                                    <Button 
                                        onClick={() => {handleEditVolumeSelectionButton(volumeId)}} 
                                        variant="outline-primary" 
                                        className="text-center p-0" 
                                        style={{ fontSize: '0.55em'}}
                                    >
                                        <img 
                                            style={{ width: '40%'}} 
                                            src={`icons\\illustration-icon.svg`}
                                        >
                                        </img>
                                    </Button>

                                    <Button 
                                        onClick={() => {handleDeleteVolumeSelectionButton(volumeId)}} 
                                        variant="outline-danger" className="text-center p-0" 
                                        style={{ fontSize: '0.55em'}}
                                    >
                                        <img 
                                            style={{ width: '30%'}} 
                                            src={`icons\\recycle-bin-icon.svg`}
                                        >
                                        </img>
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>

            <div className="d-flex flex-column gap-2 mx-3 my-2">   
                <Button onClick={handleAddVolumeSelectionButton} variant="primary" size="sm">
                    Add Volume Selection
                </Button>
                <Button onClick={closeSidebar} variant="danger" size="sm">Cancel</Button>
            </div> 
        </>
    )
}

export default EditVolumeSelectionsMenu;