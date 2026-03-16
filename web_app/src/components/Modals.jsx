import { useState , useEffect } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Toast from 'react-bootstrap/Toast';
import Form from 'react-bootstrap/Form';
import ToastContainer from 'react-bootstrap/ToastContainer';

export function DetailsModal({ displaySettings , setDisplaySettings }) {
    return (
        <Modal
            show = {displaySettings['visibleModal'] == 'details'}
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

export function SettingsModal({ displaySettings , setDisplaySettings }) {
    const [projectSettings, setProjectSettings] = useState({
        'projectName' : displaySettings['projectName'],
        'projectAuthor' : displaySettings['projectAuthor'],
        'projectDescription' : displaySettings['projectDescription']
    })
    
    const handleProjectNameChange = (e) => {
        const value = e.target.value;
        const sanitizedValue = value.replace(/[<>:"/\\|?*]/g, "");
        
        setProjectSettings(prev => ({
            ...prev, 
            projectName: sanitizedValue 
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
            'visibleModal': '',
            'projectName':projectSettings['projectName'], 
            'projectAuthor':projectSettings['projectAuthor'],
            'projectDesciption':projectSettings['projectDescription']
        }))
        console.log(projectSettings['projectName'])
    }

    const handleClose = () => {
        setDisplaySettings(prev => ({ ...prev, 'visibleModal': '' }))
        setProjectSettings(prev => ({ 
            ...prev, 
            'visibleModal': '',
            'projectName':displaySettings['projectName'], 
            'projectAuthor':displaySettings['projectAuthor'],
            'projectDesciption':displaySettings['projectDescription']
        }))
    }

    return (
        <Modal
            show={displaySettings['visibleModal'] === 'settings'}
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

export function ScannerConnectionStatusToast({showScannerConnectionToast, setShowScannerConnectionToast}) {
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

