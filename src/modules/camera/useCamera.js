import { useState, useEffect, useRef } from 'react';

export function useCamera() {
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        // Fallback to any camera if environment camera fails
        try {
          const fbStream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = fbStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fbStream;
          }
        } catch (fallbackErr) {
          setError(fallbackErr);
          console.error("Camera error:", fallbackErr);
        }
      }
    }

    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { videoRef, error };
}
