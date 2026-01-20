const ToolbarButton = ({icon, title}) => {
    return (
        <div className="d-flex align-items-center h-100 me-1">
            <button title={title} className="ToolbarButton d-flex align-items-center">
                <img src={`icons\\${icon}`}></img>
            </button>
        </div>
    )
};

export default ToolbarButton;




// Useful website for icons https://uxwing.com/
/*
function IconButton(props) {

    
    const inputRef = useRef();
    const [selectedFile, setSelectedFile] = useState(null);
    
    const handleFileClick = (event) => {
        inputRef.current.click();
    };
    const handleFileChange = (event) => {
        console.clear()
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
          console.log(e.target.result); // Prints file content to browser console
        };
        reader.readAsText(file);
    }
   

    return (
        <div class="sidebar-button">
            <button class="bg-dark sidebar-icon-button" onClick={handleFileClick}>
                <img src={`icons\\${props.name}`} alt="Snow"></img>
            </button>
            <input type="file" ref={inputRef} onChange={handleFileChange} style={{display:'none'}}></input>
        </div>
    );
}

export default IconButton;
 */