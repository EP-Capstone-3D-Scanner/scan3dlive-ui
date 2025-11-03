import React from 'react';
import IconButton from './IconButton';

function Sidebar(props) {
    return (
        <div id="Sidebar" class="bg-dark border-light position-absolute top-0 start-0">
            <IconButton name='file-color-icon.png'></IconButton>
            <IconButton name='folder-desktop-icon.png'></IconButton>
            <IconButton name='setting-icon.png'></IconButton>
        </div>
    );
}

export default Sidebar;