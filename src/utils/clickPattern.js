import { useEffect, useRef } from 'react';

export const useClickPattern = (onPatternUpdate) => {
  const patternRef = useRef([]);
  const clickTimeRef = useRef(0);
  const clickCountRef = useRef(0);
  const longPressTimerRef = useRef(null);

  useEffect(() => {
    const DOUBLE_CLICK_DELAY = 300;
    const LONG_PRESS_DURATION = 700;
    
    const handleMouseDown = (event) => {
      const button = event.button;
      
      if (button === 0) {
        longPressTimerRef.current = setTimeout(() => {
          patternRef.current.push('LL');
          onPatternUpdate([...patternRef.current]);
          clickCountRef.current = 0;
        }, LONG_PRESS_DURATION);
      }
    };
    
    const handleMouseUp = (event) => {
      event.preventDefault();
      
      const button = event.button;
      const currentTime = Date.now();
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      
      const timeSinceLastClick = currentTime - clickTimeRef.current;
      
      if (timeSinceLastClick < DOUBLE_CLICK_DELAY && clickCountRef.current === 1) {
        patternRef.current.pop();
        
        if (button === 0) {
          patternRef.current.push('DL');
        } else if (button === 2) {
          patternRef.current.push('DR');
        }
        
        clickCountRef.current = 0;
      } else {
        if (button === 0) {
          patternRef.current.push('L');
        } else if (button === 2) {
          patternRef.current.push('R');
        }
        
        clickCountRef.current = 1;
      }
      
      clickTimeRef.current = currentTime;
      onPatternUpdate([...patternRef.current]);
    };
    
    const handleContextMenu = (event) => {
      event.preventDefault();
    };
    
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenu);
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [onPatternUpdate]);
  
  const resetPattern = () => {
    patternRef.current = [];
    clickCountRef.current = 0;
    clickTimeRef.current = 0;
    onPatternUpdate([]);
  };
  
  const getPatternString = () => {
    return patternRef.current.join('-');
  };

  return {
    pattern: patternRef.current,
    resetPattern,
    getPatternString
  };
};

export const registerClickPattern = (targetPattern, callback) => {
  let pattern = [];
  let clickTime = 0;
  let clickCount = 0;
  let longPressTimer = null;

  const DOUBLE_CLICK_DELAY = 300;
  const LONG_PRESS_DURATION = 700;

  const handleMouseDown = (event) => {
    const button = event.button;
    
    if (button === 0) {
      longPressTimer = setTimeout(() => {
        pattern.push('LL');
        checkPattern();
        clickCount = 0;
      }, LONG_PRESS_DURATION);
    }
  };

  const handleMouseUp = (event) => {
    const button = event.button;
    const currentTime = Date.now();
    
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    
    const timeSinceLastClick = currentTime - clickTime;
    
    if (timeSinceLastClick < DOUBLE_CLICK_DELAY && clickCount === 1) {
      pattern.pop();
      
      if (button === 0) {
        pattern.push('DL');
      } else if (button === 2) {
        pattern.push('DR');
      }
      
      clickCount = 0;
      checkPattern();
    } else {
      if (button === 0) {
        pattern.push('L');
      } else if (button === 2) {
        pattern.push('R');
      }
      
      clickCount = 1;
    }
    
    clickTime = currentTime;
  };

  const checkPattern = () => {
    const patternString = pattern.join('-');
    if (patternString.includes(targetPattern)) {
      callback();
      pattern = [];
    }
    
    if (pattern.length > 5) {
      pattern.shift();
    }
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('contextmenu', handleContextMenu);

  return () => {
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('contextmenu', handleContextMenu);
    
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
  };
};
