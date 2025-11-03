import React from 'react';

// Useful website for icons https://uxwing.com/

function IconButton(props) {
    return (
        <div class="sidebar-button">
            <button class="bg-dark sidebar-icon-button">
                <img src={`icons\\${props.name}`} alt="Snow"></img>
            </button>
        </div>
    );
}

export default IconButton;