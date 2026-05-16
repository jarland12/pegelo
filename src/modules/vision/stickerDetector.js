export async function detectStickers(canvas, cv) {
  if (!canvas.width || !canvas.height) return [];
  
  const src = cv.imread(canvas);
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const thresh = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  // 1. Pre-procesamiento: Gris y Blur
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

  // 2. Intento 1: Umbral de Otsu (Otsu's Thresholding)
  // Útil para iluminación global variable
  cv.threshold(blurred, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
  
  let foundStickers = processContours(thresh, contours, hierarchy, src, cv);

  // 3. Intento 2 (Fallback): Adaptive Threshold
  // Útil para iluminación local desigual (sombras)
  if (foundStickers.length === 0) {
    cv.adaptiveThreshold(blurred, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);
    foundStickers = processContours(thresh, contours, hierarchy, src, cv);
  }

  // Liberar memoria
  [src, gray, blurred, thresh, contours, hierarchy].forEach(m => m.delete());

  // Ordenar de arriba a abajo y limitar a 8
  return foundStickers
    .sort((a, b) => a.y - b.y)
    .slice(0, 8);
}

function processContours(thresh, contours, hierarchy, src, cv) {
  cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  
  const stickers = [];
  const imgArea = src.rows * src.cols;

  for (let i = 0; i < contours.size(); i++) {
    const cnt = contours.get(i);
    const rect = cv.boundingRect(cnt);
    const area = rect.width * rect.height;
    const aspectRatio = rect.width / rect.height;

    // Filtrar por área (min 3%) y proporción (0.5 a 0.95)
    if (area >= imgArea * 0.03 && aspectRatio >= 0.5 && aspectRatio <= 0.95) {
      stickers.push(rect);
    }
    cnt.delete();
  }
  
  return stickers;
}
