import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { invalidateCanvas } from '../Canvas3D'
import { useContext } from 'react';
import { AppContext } from '../Contexts/Contexts';

function FormatDisplayMenu() {

    const {
        sidebarDisplay,
        setSidebarDisplay,
        displaySettings, 
        setDisplaySettings
    } = useContext(AppContext)

    const closeSidebar = () => {
        setSidebarDisplay({
            ...sidebarDisplay, 
            show:false
        });
    }

    const toggleSetting = (key) => {
        setDisplaySettings(
            prev => ({ 
                ...prev, 
                [key]: !prev[key] 
            })
        );
        invalidateCanvas();
    };

    const updateSetting = (event, key) => {
        const value = event.target.value;
        setDisplaySettings(
            prev => ({
                ...prev, 
                [key]:value
            })
        )
        invalidateCanvas()
    }

    return (
        <>
            <div className="mb-2 pb-2">Format Appearance</div>

            <Form style={{'fontSize':'0.8em'}} className="d-flex flex-column mx-3 p-2 flex-grow-1">
                <Form.Group className="d-flex flex-column" controlId="viewSelectGrid">
                    <Form.Label className="mb-3"><b>View</b></Form.Label>
                    
                    <Form.Check
                        className="d-flex flex-row gap-2 my-0"
                        label="Display Grid"
                        name="gridSelectCheckbox"
                        type="checkbox"
                        checked={displaySettings.gridVisible}
                        onChange={()=>toggleSetting('gridVisible')}
                    />

                    <div className="d-flex flex-row gap-3 my-1">
                        <Form.Check
                            className="align-items-center d-flex flex-row gap-2"
                            label="Background"
                            name="gridSelectCheckbox"
                            type="checkbox"
                            checked={displaySettings.backgroundVisible}
                            onChange={()=>toggleSetting('backgroundVisible')}
                        />

                        <Form.Control
                            type="color"
                            size="sm"
                            title="Choose your color"
                            className="ms-auto form-control-color"
                            onChange={(e)=>updateSetting(e, 'backgroundColor')} 
                        />
                    </div>

                    <div className="d-flex flex-row gap-3 mt-2">
                        <Form.Check
                            className="align-items-center d-flex flex-row gap-2"
                            label="Skybox"
                            name="gridSelectCheckbox"
                            type="checkbox"
                            checked={displaySettings.skyboxVisible}
                            onChange={()=>toggleSetting('skyboxVisible')}
                        />

                        <Form.Select 
                            size="sm" 
                            style={{ fontSize: '0.8em' }}
                            onChange={(e)=>updateSetting(e, 'skyboxPreset')}
                        >
                            <option value="city">City</option>
                            <option value="dawn">Dawn</option>
                            <option value="night">Night</option>
                            <option value="park">Park</option>
                        </Form.Select>
                    </div>
                </Form.Group> 
                
                <Form.Group 
                    className="d-flex flex-column flex-grow-1 mt-3 border-top pt-1" 
                    controlId="displaySelectGrid"
                >
                    <Form.Label className="mb-2"><b>Display</b></Form.Label>

                    <Form.Check
                        className="d-flex flex-row gap-2 my-1"
                        label="Hide Labels"
                        name="annotationSelectCheckbox"
                        type="checkbox"
                        checked={!displaySettings.showLabels}
                        onChange={()=>toggleSetting('showLabels')}
                    />

                    <div className="d-flex flex-row gap-3 my-1">
                        <Form.Label>LOD</Form.Label>
                        <Form.Range
                            defaultValue={displaySettings.octreeMaxLOD}
                            min={1}
                            max={15}
                            step={1}
                            onChange={(e)=>updateSetting(e, 'octreeMaxLOD')}
                        />
                    </div>
                </Form.Group>  
            </Form>
            
            <div className="d-flex flex-row gap-2 mx-3 my-2">   
                <Button 
                    className="flex-grow-1" 
                    variant="primary" 
                    size="sm"
                    onClick={closeSidebar}
                >
                    Save Changes
                </Button>
            </div> 
        </>
    )
}

export default FormatDisplayMenu;