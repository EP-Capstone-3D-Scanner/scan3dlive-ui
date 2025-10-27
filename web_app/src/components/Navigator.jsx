import React from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

const Navigator = () => {
    return (
        <Navbar className = "border-bottom border-dark ps-3 pe-3 w-100">
            <Navbar.Brand className = "ms-0">
                <p className="h3 fw-bold text-dark">Point Cloud Viewer</p>
            </Navbar.Brand>
            <Nav className = "ms-auto">
                <Nav.Link className = "text-dark">Settings</Nav.Link>
                <Nav.Link className = "text-dark">Help</Nav.Link>
            </Nav>
        </Navbar>   
    );
};

export default Navigator;