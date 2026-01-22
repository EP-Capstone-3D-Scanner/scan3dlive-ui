import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export function DetailsModal({visibleModal, setVisibleModal}) {
    return (
        <Modal
            show = {visibleModal == 'details'}
            onHide={() => setVisibleModal('')}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    <b>Real-Time 3D Scan Visualizer</b>
                </Modal.Title>
            </Modal.Header>
                <Modal.Body>
                    <h4>Purpose</h4>
                    <p>
                        This 3D scan visualizer is designed to display real-time 3D scan data from
                        an NVIDIA Jetson Orin NANO 3D scanner. It was built using React Three Fiber
                        and React Bootstrap. 
                    </p>

                    <h4>More Information</h4>
                    <p>
                        For more information, see the docs <a target="new" href="https://github.com/EP-Capstone-3D-Scanner/ECE-494-495-Design-Project-3D-Point-Cloud-Reconstruction">here</a>.
                        To learn more about React Three Fiber see its <a target="new" href="https://r3f.docs.pmnd.rs">documentation</a>. 
                    </p>
                </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => setVisibleModal('')}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}