import { useEffect, useRef, useContext } from 'react';
import { AppContext } from '../Contexts/Contexts'; 

export const ClipboardManager = () => {
  const { copySelection, cutSelection, pasteSelection } = useContext(AppContext);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelection();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        cutSelection();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copySelection, cutSelection, pasteSelection]);

  return null; 
};