import React from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';

function Sidebar({sidebarDisplay, setSidebarDisplay, annotations, setAnnotations}) {
    return (
        <div id="Sidebar" class={`${sidebarDisplay ? "" : "close"} bg-dark h-100 border-light position-absolute top-0 text-white overflow-hidden`}>
            <Tabs defaultActiveKey="edit" className="Sidebar-tab mb-3" fill>
                <Tab eventKey="info" title="Info">
                    Point cloud information will go here...
                </Tab>
                <Tab eventKey="edit" title="Edit">
                </Tab>
            </Tabs>
        </div>
    );
}

export default Sidebar;

/*
<ListGroup className="w-100">
{Array.from(annotations.entries()).map(([id, annotation]) => (
<ListGroup.Item key={id} className="Sidebar-annotation-item d-flex me-auto w-100 align-items-center">
{`Object ${annotation.label}`}
{/*<Form.Control size="sm w-50 h-25 bg-dark border-none" type="text" placeholder="Large text" />
</ListGroup.Item>
))}
</ListGroup>
*/