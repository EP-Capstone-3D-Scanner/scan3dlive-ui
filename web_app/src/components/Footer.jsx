import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { AppContext } from './Contexts/Contexts';
import { useContext } from 'react'
import { DetailsModal , ScannerConnectionStatusToast , SettingsModal , SaveAsModal } from './Modals'

const Footer = () => {
    
    const {
        displaySettings, 
        setDisplaySettings, 
    } = useContext(AppContext)
    
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
                                setDisplaySettings(prev => ({...prev, visibleModal:'settings'}));
                                e.currentTarget.blur();
                            }}
                    >
                        <span>{displaySettings.projectName}</span>
                    </Button>
                </OverlayTrigger>

                
                <Button 
                    className="ms-auto d-flex flex-column justify-content-center h-100 footer-button" 
                    variant="dark"
                >
                    Point Count: {displaySettings.totalPoints}
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
                            setDisplaySettings(prev => ({...prev, visibleModal:'details'}));
                            e.currentTarget.blur();
                        }}
                    >
                            ⓘ
                    </Button>
                </OverlayTrigger>

            </div>
            
            <SettingsModal></SettingsModal>
            <DetailsModal></DetailsModal>
            <SaveAsModal></SaveAsModal>
            <ScannerConnectionStatusToast></ScannerConnectionStatusToast>
        </>
    )
};

export default Footer;