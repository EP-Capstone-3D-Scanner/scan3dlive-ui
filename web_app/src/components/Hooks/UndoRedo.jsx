import { useRef , useEffect , useCallback } from 'react'

function useUndoRedo({ volumeSelections, setVolumeSelections, deletionSelection, setDeletionSelection , sidebarDisplay, setSidebarDisplay }) {
    const undoStackRef = useRef([]);
    const redoStackRef = useRef([]);
    
    // Track the latest state in a ref to avoid stale closures in the event listener
    const currentStateRef = useRef({ volumeSelections, deletionSelection , sidebarDisplay });
    
    useEffect(() => {
        currentStateRef.current = { volumeSelections, deletionSelection , sidebarDisplay };
    }, [volumeSelections, deletionSelection , sidebarDisplay]);

    const clearUndoStack = useCallback(() => {
        undoStackRef.current = [];
    }, []);

    const clearRedoStack = useCallback(() => {
        redoStackRef.current = [];
    }, []);

    const pushUndoStack = useCallback((stateToSave) => {
        const state = stateToSave || currentStateRef.current;
        undoStackRef.current.push(state);
        clearRedoStack();
    }, [clearRedoStack]);

    const undo = useCallback(() => {
        console.log('tried to undo')
        if (undoStackRef.current.length === 0) return;

        // Save the current state to the redo stack
        redoStackRef.current.push(currentStateRef.current);

        // Pop the previous state from the undo stack and apply it
        const backwardState = undoStackRef.current.pop();
        setVolumeSelections(backwardState.volumeSelections);
        setDeletionSelection(backwardState.deletionSelection);
        setSidebarDisplay(backwardState.sidebarDisplay);
    }, [setVolumeSelections, setDeletionSelection, setSidebarDisplay]);

    const redo = useCallback(() => {
        if (redoStackRef.current.length === 0) return;

        // Save the current state to the undo stack
        undoStackRef.current.push(currentStateRef.current);

        // Pop the future state from the redo stack and apply it
        const forwardState = redoStackRef.current.pop();
        setVolumeSelections(forwardState.volumeSelections);
        setDeletionSelection(forwardState.deletionSelection);
        setSidebarDisplay(forwardState.sidebarDisplay);
    }, [setVolumeSelections, setDeletionSelection, setSidebarDisplay]);

    // Attach Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check for CTRL + Z
            if (e.ctrlKey && e.key.toLowerCase() === 'z') {
                console.log(undoStackRef.current)
                e.preventDefault(); // Prevents browser's native undo
                undo();
            }
            // Check for CTRL + Y
            if (e.ctrlKey && e.key.toLowerCase() === 'y') {
                e.preventDefault(); // Prevents browser's native redo
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    // Return the functions so they can be drilled down to child components
    return {
        //undo,
        //redo,
        pushUndoStack,
        //clearUndoStack,
        //clearRedoStack
    };
}

export default useUndoRedo;