import { useState } from 'react'
import { DetailsModal } from './Modals'
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const Footer = ({}) => {
    const [visibleModal, setVisibleModal] = useState('none');

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
                    >
                        <span>Untitled-0</span>
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
                        MKS
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
                        onClick = {() => setVisibleModal('details')}
                    >
                            ⓘ
                    </Button>
                </OverlayTrigger>

            </div>

            <DetailsModal
                visibleModal={visibleModal}
                setVisibleModal={setVisibleModal}
            >
            </DetailsModal>
        </>
    )
};

export default Footer;