import DeletionSelectionMenu from './SidebarMenus/DeletionSelection';
import FormatDisplayMenu from './SidebarMenus/FormatDisplay'
import UpdateVolumeSelectionMenu from './SidebarMenus/UpdateVolumeSelections'
import EditVolumeSelectionsMenu from './SidebarMenus/EditVolumeSelections'
import { useContext } from 'react';
import { AppContext } from './Contexts/Contexts';

function Sidebar() {
    
    const { sidebarDisplay } = useContext(AppContext)

    return (
        <div 
            id="Sidebar"
            style={{ zIndex: 99999999 }} 
            className={`${sidebarDisplay.show ? "" : "close"} bg-dark h-100 border-light position-absolute top-0 text-white d-flex flex-column`}
        >
            {sidebarDisplay.page === 'EditVolumeSelectionsMenu' && <EditVolumeSelectionsMenu />}
            {sidebarDisplay.page === 'EditViewSelectionsMenu' && <FormatDisplayMenu></FormatDisplayMenu>}
            {sidebarDisplay.page === 'UpdateVolumeSelectionMenu' && <UpdateVolumeSelectionMenu></UpdateVolumeSelectionMenu>}
            {sidebarDisplay.page == 'DeletionSelectionMenu' && <DeletionSelectionMenu></DeletionSelectionMenu>}
        </div>
    );
}

export default Sidebar;




{/*<Tabs defaultActiveKey="edit" className="Sidebar-tab mb-3" fill>
<Tab eventKey="info" title="Info">
Point cloud information will go here...
</Tab>
<Tab eventKey="edit" title="Edit">
</Tab>
</Tabs>*/}
