import { createWorker } from 'tesseract.js';
import { useEffect, useRef, useState } from 'react';

export function useOCR() {
  const workerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let worker;
    async function initWorker() {
      // Usamos el flujo de Tesseract.js v4+ / v5+
      worker = await createWorker('eng');
      
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789',
        tessedit_pageseg_mode: '7', // SINGLE_LINE
      });

      workerRef.current = worker;
      setReady(true);
    }

    initWorker();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  async function recognizeMultiple(canvases) {
    if (!workerRef.current || !ready) return [];

    // Procesar en paralelo para aprovechar Tesseract
    const results = await Promise.all(
      canvases.map(async (canvas) => {
        const { data: { text } } = await workerRef.current.recognize(canvas);
        return text.trim();
      })
    );
    return results;
  }

  return { ready, recognizeMultiple };
}
