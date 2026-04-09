import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Toast from 'react-bootstrap/Toast';
import Form from 'react-bootstrap/Form';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { AppContext } from './Contexts/Contexts';
import { useState , useEffect , useContext } from 'react'

export function DetailsModal() {
    
    const { 
        displaySettings, 
        setDisplaySettings 
    } = useContext(AppContext)

    return (
        <Modal
            show = {displaySettings.visibleModal == 'details'}
            style={{ zIndex: 99999999}}
            onHide={() => setDisplaySettings(prev=>({...prev, 'visibleModal':''}))}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter" className="w-100 text-center">
                    <b>Real-Time 3D Scan Visualizer</b>
                </Modal.Title>
            </Modal.Header>
                <Modal.Body>
                    <p>
                        This 3D scan visualizer is designed to display real-time 3D scan data from
                        an NVIDIA Jetson Orin NANO 3D scanner. It was built using React Three Fiber
                        and React Bootstrap. 
                    </p>

                    <h4>Release Notes (v1.1)</h4>
                    <ul>
                        <li>Data collected from the 3D scanner can now be saved in PLY file format</li>
                        <li>Users can add volume selection boxes by dragging with mouse</li>
                        <li>Scanner connection toast now shows when scanner network status changes</li>
                        <li>Various bug fixes</li>
                    </ul> 

                    <h4>Release Notes (v1.0)</h4>
                    <ul>
                        <li>Updated sidebar to allow for scene modifications and skyboxes</li>
                        <li>Implemented fullscreen button to make content take up entire browser screen</li>
                        <li>Added display modal that shows when the webpage is opened</li>
                    </ul> 

                    <h4>More Information</h4>
                    <p>
                        For more information, see the docs <a target="new" href="https://github.com/EP-Capstone-3D-Scanner/ECE-494-495-Design-Project-3D-Point-Cloud-Reconstruction.git">here</a>.
                        To learn more about React Three Fiber see its <a target="new" href="https://r3f.docs.pmnd.rs">documentation</a>. 
                    </p>
                </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => setDisplaySettings(prev=>({...prev, 'visibleModal':''}))}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}

export function SettingsModal() {
    
    const { 
        displaySettings, 
        setDisplaySettings 
    } = useContext(AppContext)

    const [projectSettings, setProjectSettings] = useState({
        projectName: displaySettings.projectName,
        projectAuthor: displaySettings.projectAuthor,
        projectDescription: displaySettings.projectDescription
    })
    
    const handleProjectNameChange = (e) => {
        const value = e.target.value;
        const sanitizedValue = value.replace(/[<>:"/\\|?*]/g, "");
        
        setProjectSettings(prev => ({
            ...prev, 
            projectName : sanitizedValue 
        }));
    };

    const handleChange = (field, value) => {
        setProjectSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        setDisplaySettings(prev => ({ 
            ...prev, 
            visibleModal: '',
            projectName: projectSettings.projectName, 
            projectAuthor: projectSettings.projectAuthor,
            projectDesciption: projectSettings.projectDescription
        }))
    }

    const handleClose = () => {
        setDisplaySettings(
            prev => ({ 
                ...prev, 
                visibleModal: '' 
            })
        )
        setProjectSettings(prev => ({ 
            ...prev, 
            visibleModal:  '',
            projectName: displaySettings.projectName, 
            projectAuthor: displaySettings.projectAuthor,
            projectDesciption: displaySettings.projectDescription
        }))
    }

    return (
        <Modal
            show={displaySettings.visibleModal === 'settings'}
            style={{ zIndex: 99999999 }}
            onHide={handleClose}
            size="md"
            centered
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter" className="w-100 text-center">
                    <b>Settings</b>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>

                    <Form.Group controlId="projectName" className="mb-2">
                        <Form.Label>Project Name</Form.Label>
                        <Form.Control
                            size="sm"  
                            type="text" 
                            placeholder="e.g. My_3D_Scan"
                            value={projectSettings.projectName || ''}
                            onChange={handleProjectNameChange}
                        />
                        <Form.Text className="text-muted" style={{ fontSize: '0.8em' }}>
                            Forbidden: {"< > : \" / \\ | ? *"}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="authorName" className="mb-2">
                        <Form.Label>Author Name</Form.Label>
                        <Form.Control 
                            size="sm" 
                            type="text" 
                            placeholder="Enter name"
                            value={projectSettings.authorName || ''}
                            onChange={(e) => handleChange('authorName', e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="description" className="mb-2">
                        <Form.Label>Short Description</Form.Label>
                        <Form.Control 
                            size="sm" 
                            as="textarea" 
                            rows={3} 
                            placeholder="Describe this scan..."
                            value={projectSettings.projectDescription || ''}
                            onChange={(e) => handleChange('projectDescription', e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export function SaveAsModal() {
    
    const { 
        displaySettings, 
        setDisplaySettings, 
        volumeSelections, 
        octreeWorkerRef , 
        isWorkerBusy
    } = useContext(AppContext)

    const [saveAsSettings, setSaveAsSettings] = useState({
        saveAsName: displaySettings.projectName || '',
        saveAsSelection: '',
        saveAsType: 'All Data',
    });

    const pointTypes = {
        '0': 'Ceiling',
        '1': 'Floor',
        '2': 'Wall',
        '3': 'Beam',
        '4': 'Column',
        '5': 'Window',
        '6': 'Door',
        '7': 'Chair',
        '8': 'Table',
        '9': 'Bookcase',
        '10': 'Sofa',
        '11': 'Board',
        '12': 'Clutter'
    }
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (saveAsSettings.saveAsType === 'All Data') {
            setItems([{ label: 'N/A', value: 'all' }]);
            setSaveAsSettings(
                prev => ({ 
                    ...prev, 
                    saveAsSelection: 'all' 
                })
            );
        } 
        else if (saveAsSettings.saveAsType === 'Volume') {
            const volumes = Object.entries(volumeSelections || {}).map(([id, v]) => ({ 
                label: v.name || id, 
                value: id 
            }));
            
            setItems(volumes);
            setSaveAsSettings(prev => ({ 
                ...prev, 
                saveAsSelection: volumes.length > 0 ? volumes[0].value : '' 
            }));
        } 
        else if (saveAsSettings.saveAsType === 'Point Type') {
            const points = Object.entries(pointTypes || {}).map(([id, pointLabel]) => ({ 
                label: pointLabel, 
                value: id 
            }));
            setItems(points);
            setSaveAsSettings(prev => ({ 
                ...prev, 
                saveAsSelection: points.length > 0 ? points[0].value : '' 
            }));
        }
    }, [saveAsSettings.saveAsType, volumeSelections]); // Safely scoped dependencies

    const handleSaveAsNameChange = (e) => {
        const value = e.target.value;
        const sanitizedValue = value.replace(/[<>:"/\\|?*]/g, "");
        
        setSaveAsSettings(prev => ({
            ...prev, 
            saveAsName: sanitizedValue 
        }));
    };

    const handleChange = (field, value) => {
        setSaveAsSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveAs = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        console.log("Saving with settings:", saveAsSettings);
        if (octreeWorkerRef) {
            isWorkerBusy.current = true;
            
            if (saveAsSettings.saveAsType === 'All Data') {
                octreeWorkerRef.current.postMessage({ 
                    type: 'SAVE', 
                    payload: {
                        pointType: 255, // 255 = save everything
                        fileName: saveAsSettings.saveAsName
                    } 
                });
            }
            else if (saveAsSettings.saveAsType === 'Volume') {
                const volumeId = saveAsSettings.saveAsSelection;
                
                if (!volumeId || !volumeSelections[volumeId]) {
                    console.error("No valid volume selected.");
                    isWorkerBusy.current = false;
                    return;
                }

                octreeWorkerRef.current.postMessage({ 
                    type: 'SAVE_AS_VOL', 
                    payload: { 
                        ...volumeSelections[volumeId], 
                        fileName: saveAsSettings.saveAsName
                    } 
                });
            }
            else if (saveAsSettings.saveAsType == 'Point Type') {
                octreeWorkerRef.current.postMessage({ 
                    type: 'SAVE', 
                    payload: { 
                        pointType: parseInt(saveAsSettings.saveAsSelection),
                        fileName: saveAsSettings.saveAsName
                    } 
                });
            }
        }
    };

    const handleClose = () => {
        setDisplaySettings(
            prev => ({ 
                ...prev, 
                visibleModal: '' 
            })
        );
        setSaveAsSettings({
            saveAsName: displaySettings.projectName || '',
            saveAsSelection: 'all',
            saveAsType: 'All Data',
        });
    };

    return (
        <Modal
            show={displaySettings.visibleModal === 'save_as'}
            style={{ zIndex: 99999999 }}
            onHide={handleClose}
            size="md"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title className="w-100 text-center">
                    <b>Save Data...</b>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSaveAs}>
                    <Form.Group className="mb-3">
                        <Form.Label>Region:</Form.Label>
                        <Form.Select 
                            value={saveAsSettings.saveAsType}
                            onChange={(e) => handleChange('saveAsType', e.target.value)} 
                            size="sm"
                        >
                            <option value="All Data">All Data</option>
                            <option value="Volume">Volume</option>
                            <option value="Point Type">Point Type</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Selection:</Form.Label>
                        <Form.Select 
                            disabled={(saveAsSettings.saveAsType === 'All Data') || (items.length === 0)} 
                            value={saveAsSettings.saveAsSelection}
                            onChange={(e) => handleChange('saveAsSelection', e.target.value)}
                            size="sm" 
                        >
                            {items.map((item, index) => (
                                <option key={index} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Save As:</Form.Label>
                        <Form.Control
                            size="sm"  
                            type="text" 
                            placeholder="e.g. My_3D_Scan"
                            value={saveAsSettings.saveAsName}
                            onChange={handleSaveAsNameChange}
                        />
                        <Form.Text className="text-muted" style={{ fontSize: '0.8em' }}>
                            Forbidden: {"< > : \" / \\ | ? *"}
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={handleSaveAs}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export function ScannerConnectionStatusToast() {
    const {connected} = useContext(AppContext)
    const [showScannerConnectionToast, setShowScannerConnectionToast] = useState(false);
    
    useEffect(()=>{
        setShowScannerConnectionToast(true)
    }, [connected])

    const handleClose = () => {
        setShowScannerConnectionToast(false)
    }

    return (
        <div 
            className="p-0 border border-dark" 
            style={{ position: 'fixed', "bottom": "1.2em", right: 0, zIndex: 1 }}
        >
            <ToastContainer className="p-0"position={"bottom-end"}style={{ zIndex: 1 }}>
                <Toast onClose={handleClose} show={showScannerConnectionToast}>
                <Toast.Header>
                    <strong className="me-auto">Scanner Connection Status</strong>
                    <small>Just now</small>
                </Toast.Header>
                <Toast.Body>The status of the scanner has changed.</Toast.Body>
            </Toast>
            </ToastContainer>
        </div>
    );
}

