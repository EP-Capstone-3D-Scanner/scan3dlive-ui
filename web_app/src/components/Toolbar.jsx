import ToolbarButton from './ToolbarButton'
import { invalidateCanvas, getCamera } from './Canvas3D'

const Toolbar = ({sidebarDisplay, setSidebarDisplay, cameraFOVRef}) => {
    const handleClipButtonClick = () => {
        setSidebarDisplay(true);
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

    return (
        <div id="Toolbar" className="d-flex ps-2 flex-row align-items-center">
            <ToolbarButton onClick={handleClipButtonClick} icon="cube-icon.svg" title="Clip"></ToolbarButton>
            <ToolbarButton onClick={handleZoomInButtonClick} icon="zoom-in-icon.svg" title="Zoom In"></ToolbarButton>
            <ToolbarButton onClick={handleZoomOutButtonClick} icon="zoom-out-icon.svg" title="Zoom Out"></ToolbarButton>
            <ToolbarButton onClick={setSidebarDisplay} icon="reply-arrow-icon.svg" title="Undo"></ToolbarButton>
            <ToolbarButton onClick={setSidebarDisplay} icon="forward-arrow-icon.svg" title="Redo"></ToolbarButton>
            <ToolbarButton onClick={setSidebarDisplay} icon="recycle-bin-icon.svg" title="Delete"></ToolbarButton>
            <button 
                className="Sidebar-toggle-button ms-auto h-100" 
                onClick={()=>{setSidebarDisplay(!sidebarDisplay);}}>
                ◥
            </button>
        </div>
    )
};

export default Toolbar;