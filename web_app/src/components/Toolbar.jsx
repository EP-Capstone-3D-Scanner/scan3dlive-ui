import ToolbarButton from './ToolbarButton'
import { invalidateCanvas, getCamera } from './Canvas3D'
import Form from 'react-bootstrap/Form';

const Toolbar = ({sidebarDisplay, setSidebarDisplay}) => {
    const handleVolumeSelectionButtonClick = () => {
        setSidebarDisplay(prev=>({...prev, 'page':'EditVolumeSelectionsMenu', 'show':true, 'showDeletionSelection':false}));
    }

    const handleDeleteButtonClick = () => {
        setSidebarDisplay(prev=>({...prev, 'page':'DeletionSelectionMenu', 'show':true, 'showDeletionSelection':true}));
    }

    const handleZoomInButtonClick = () => {
        const cam = getCamera()
            if (!cam) return

        cam.fov -= 10
        cam.updateProjectionMatrix()
        invalidateCanvas()
    }

    const handleZoomOutButtonClick = () => {
        const cam = getCamera()
            if (!cam) return

        cam.fov += 10
        cam.updateProjectionMatrix()
        invalidateCanvas()
    }

    const handlePointLabelButtonClick = (e) => {
        const value = e.target.value;
        setSidebarDisplay(prev=>({...prev, 'pointLabelType':value}))
    }

    return (
        <div id="Toolbar" className="d-flex ps-2 flex-row align-items-center bg-dark">
            <ToolbarButton onClick={handleVolumeSelectionButtonClick} icon="cube-icon.svg" title="Volume Selection"></ToolbarButton>
            <ToolbarButton onClick={handleZoomInButtonClick} icon="zoom-in-icon.svg" title="Zoom In"></ToolbarButton>
            <ToolbarButton onClick={handleZoomOutButtonClick} icon="zoom-out-icon.svg" title="Zoom Out"></ToolbarButton>
            <ToolbarButton onClick={setSidebarDisplay} icon="reply-arrow-icon.svg" title="Undo"></ToolbarButton>
            <ToolbarButton onClick={setSidebarDisplay} icon="forward-arrow-icon.svg" title="Redo"></ToolbarButton>
            <ToolbarButton onClick={handleDeleteButtonClick} icon="recycle-bin-icon.svg" title="Delete"></ToolbarButton>
            <Form.Select
                id="PointLabelSelect" 
                className="bg-dark text-light ms-2" 
                style={{ width: '10em', padding: '0.1em 0.6em'}}
                defaultValue=""
                onChange={handlePointLabelButtonClick}
                size="sm"
            >
                <option disabled hidden value="">Select Option</option>
                <option value="">None</option>
                <option value="1">Beam</option>
                <option value="2">Board</option>
                <option value="3">Bookcase</option>
                <option value="4">Ceiling</option>
                <option value="5">Chair</option>
                <option value="6">Column</option>
                <option value="7">Door</option>
                <option value="8">Floor</option>
                <option value="9">Sofa</option>
                <option value="10">Table</option>
                <option value="11">Wall</option>
                <option value="12">Window</option>
                <option value="13">Clutter</option>
            </Form.Select>
            
            <button 
                className="Sidebar-toggle-button ms-auto h-100" 
                onClick={()=>{
                    const showing = sidebarDisplay['show'];
                    setSidebarDisplay(prev=>({...prev, 'show':!showing}));
                    }}>
                ◥
            </button>
        </div>
    )
};

export default Toolbar;