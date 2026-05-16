export function extractBadgeROI(sourceCanvas, rect) {
  const { x, y, width: w, height: h } = rect;

  // El badge (pastilla gris) está en el 40% derecho y 20% superior
  const pad = w * 0.05; // 5% de padding
  
  const roiX = Math.max(0, x + w * 0.60 - pad);
  const roiY = Math.max(0, y - pad);
  const roiW = Math.min(sourceCanvas.width - roiX, w * 0.40 + pad * 2);
  const roiH = Math.min(sourceCanvas.height - roiY, h * 0.20 + pad * 2);

  const canvas = document.createElement('canvas');
  canvas.width = roiW;
  canvas.height = roiH;
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(sourceCanvas, roiX, roiY, roiW, roiH, 0, 0, roiW, roiH);

  return canvas;
}
