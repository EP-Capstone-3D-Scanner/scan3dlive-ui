import React from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

function Sidebar({sidebarDisplay, setSidebarDisplay}) {
    return (
        <div id="Sidebar" class={`${sidebarDisplay ? "" : "close"} bg-dark h-100 border-light position-absolute top-0 text-white overflow-hidden`}>
            <Tabs defaultActiveKey="home" className="Sidebar-tab mb-3" fill>
                <Tab eventKey="home" title="Info">
                    Tab content for Home
                </Tab>
                <Tab eventKey="home2" title="Edit" disabled>
                    Tab content for One
                </Tab>
            </Tabs>
        </div>
    );
}

export default Sidebar;