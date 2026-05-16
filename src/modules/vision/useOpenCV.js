import { useState, useEffect } from 'react';

export function useOpenCV() {
  const [cv, setCv] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkCV = () => {
      if (window.cv && window.cv.onRuntimeInitialized) {
        // Many versions use a callback or ready flag
        setCv(window.cv);
        setReady(true);
        return true;
      }
      if (window.cv && typeof window.cv.Mat !== 'undefined') {
        // Some versions are just available immediately
        setCv(window.cv);
        setReady(true);
        return true;
      }
      return false;
    };

    if (checkCV()) return;

    const interval = setInterval(() => {
      if (checkCV()) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return { cv, ready };
}
