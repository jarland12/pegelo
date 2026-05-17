export function preprocessROI(videoElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const vw = videoElement.videoWidth;
  const vh = videoElement.videoHeight;
  
  // ROI: esquina superior derecha — 25% ancho, 20% alto
  const roiX = vw * 0.72;
  const roiY = vh * 0.02;
  const roiW = vw * 0.26;
  const roiH = vh * 0.18;
  
  // Escalar x3 para mejor OCR
  canvas.width = roiW * 3;
  canvas.height = roiH * 3;
  
  ctx.drawImage(videoElement, roiX, roiY, roiW, roiH, 0, 0, canvas.width, canvas.height);
  
  // Procesar píxel a píxel
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Escala de grises
    const gray = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
    // Contraste (stretch)
    const contrast = Math.min(255, Math.max(0, (gray - 128) * 2 + 128));
    // Binarizar + invertir (fondo negro → blanco para Tesseract)
    const binary = contrast > 100 ? 0 : 255;
    data[i] = data[i+1] = data[i+2] = binary;
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
