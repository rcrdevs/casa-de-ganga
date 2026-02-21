import { useState, useEffect, useRef, useCallback } from 'react';

export function useInactivityDetector(timeout = 2000) {
  const [isInactive, setIsInactive] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    setIsInactive(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsInactive(true), timeout);
  }, [timeout]);

  useEffect(() => {
    window.addEventListener('mousemove', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return isInactive;
}