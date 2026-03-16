import { useState , useEffect } from 'react'
import { DetailsModal , ScannerConnectionStatusToast , SettingsModal , SaveAsModal } from './Modals'
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const Footer = ({displaySettings, setDisplaySettings, volumeSelections, scannerOnline, octreeWorkerRef, isWorkerBusy}) => {
    const [showScannerConnectionToast, setShowScannerConnectionToast] = useState(false);
    useEffect(()=>{
        setShowScannerConnectionToast(true)
    }, [scannerOnline])
    
    return (
        <>
            <div id="Footer" className="d-flex flex-row bg-dark">

                <OverlayTrigger placement={'top'}
                    overlay={
                        <Tooltip 
                            className="footer-tooltip" 
                            style={{'fontSize':'0.7em', 'marginBottom':'-0.65em'}}
                        >
                            Project
                        </Tooltip>
                    }
                >
                    <Button 
                        className="d-flex flex-column justify-content-center h-100 footer-button" 
                        variant="dark"
                        onClick={(e) => {
                                setDisplaySettings(prev => ({...prev, 'visibleModal':'settings'}));
                                e.currentTarget.blur();
                            }}
                    >
                        <span>{displaySettings['projectName']}</span>
                    </Button>
                </OverlayTrigger>

                
                <Button 
                    className="ms-auto d-flex flex-column justify-content-center h-100 footer-button" 
                    variant="dark"
                >
                    Last Update: (3 Days Ago)
                </Button>
                

                <OverlayTrigger placement={'top'}
                    overlay={
                        <Tooltip 
                            className="footer-tooltip" 
                            style={{'fontSize':'0.7em', 'marginBottom':'-0.65em'}}
                        >
                            Units
                        </Tooltip>
                    }
                >
                    <Button 
                        className="d-flex flex-column justify-content-center h-100 footer-button" 
                        variant="dark"
                    >
                        meter, kg, sec
                    </Button>
                </OverlayTrigger>
            
            
                <OverlayTrigger placement={'top'}
                    overlay={
                        <Tooltip 
                            className="footer-tooltip" 
                            style={{'fontSize':'0.7em', 'marginBottom':'-0.65em'}}
                        >
                            More Details
                        </Tooltip>
                    }
                >
                    <Button 
                        style={{'fontSize':'1em'}} 
                        className="d-flex flex-column justify-content-center h-100 footer-button" 
                        variant="dark"
                        onClick = {(e) => {
                            setDisplaySettings(prev => ({...prev, 'visibleModal':'details'}));
                            e.currentTarget.blur();
                        }}
                    >
                            ⓘ
                    </Button>
                </OverlayTrigger>

            </div>
            
            <SettingsModal
                displaySettings={displaySettings}
                setDisplaySettings={setDisplaySettings}
            >
            </SettingsModal>

            <ScannerConnectionStatusToast
                showScannerConnectionToast={showScannerConnectionToast}
                setShowScannerConnectionToast={setShowScannerConnectionToast}
            >
            </ScannerConnectionStatusToast>
            
            <DetailsModal
                displaySettings={displaySettings}
                setDisplaySettings={setDisplaySettings}
            >
            </DetailsModal>

            <SaveAsModal
                volumeSelections={volumeSelections}
                displaySettings={displaySettings}
                setDisplaySettings={setDisplaySettings}
                octreeWorkerRef={octreeWorkerRef}
                isWorkerBusy={isWorkerBusy}
            >
            </SaveAsModal>
        </>
    )
};

export default Footer;