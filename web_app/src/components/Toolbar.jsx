import ToolbarButton from './ToolbarButton'

const Toolbar = ({sidebarDisplay, setSidebarDisplay}) => {
    return (
        <div id="Toolbar" className="d-flex ps-2 flex-row align-items-center">
            <ToolbarButton icon="cube-icon.svg" title="Clip"></ToolbarButton>
            <ToolbarButton icon="zoom-in-icon.svg" title="Zoom In"></ToolbarButton>
            <ToolbarButton icon="zoom-out-icon.svg" title="Zoom Out"></ToolbarButton>
            <ToolbarButton icon="reply-arrow-icon.svg" title="Undo"></ToolbarButton>
            <ToolbarButton icon="forward-arrow-icon.svg" title="Redo"></ToolbarButton>
            <ToolbarButton icon="recycle-bin-icon.svg" title="Delete"></ToolbarButton>
            <button 
                className="Sidebar-toggle-button ms-auto h-100" 
                onClick={()=>{setSidebarDisplay(!sidebarDisplay);}}>
                ◥
            </button>
        </div>
    )
};

export default Toolbar;