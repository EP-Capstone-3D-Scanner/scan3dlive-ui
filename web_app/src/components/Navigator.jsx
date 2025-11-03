import React from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

const Navigator = () => {
    return (
        <Navbar id = "Navigator" className = "ps-3 pe-3 pb-0 w-100 bg-dark">
            <Navbar.Brand className = "ms-0">
                <p className="h3 fw-bold text-white">Point Cloud Viewer</p>
            </Navbar.Brand>
            <Nav className = "ms-auto">
                <Nav.Link className = "text-white">Settings</Nav.Link>
                <Nav.Link className = "text-white">Help</Nav.Link>
            </Nav>
        </Navbar>   
    );
};

export default Navigator;