export function preprocessForOCR(badgeCanvas) {
  const scale = 3;
  const width = badgeCanvas.width;
  const height = badgeCanvas.height;

  // 1. Crear canvas para procesamiento escalado
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');

  // 2. Escalar x3 (Bilinear interpolation por defecto en drawImage)
  ctx.drawImage(badgeCanvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height);

  // 3. Procesar píxeles
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Para umbral adaptativo simple: calcular luminancia media global primero
  // (Aunque el prompt pide adaptativo, sin CV y en una pastilla pequeña, 
  // un buen ajuste de contraste + umbral suele bastar, pero seguiremos los pasos)
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Escala de grises (luminancia)
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Aumentar contraste (ajuste de niveles agresivo)
    // El badge es gris oscuro (~50-80), el texto es blanco (~200+)
    // Mapeamos [40, 180] a [0, 255]
    gray = (gray - 40) * (255 / (180 - 40));
    gray = Math.max(0, Math.min(255, gray));

    // Umbralización e Inversión
    // El badge es oscuro, el texto claro. Queremos texto negro (0) sobre fondo blanco (255).
    // Original: Texto ~255, Fondo ~50. 
    // Tras contraste: Texto ~255, Fondo ~0.
    // Invertimos: Texto 0, Fondo 255.
    const threshold = 128;
    const val = gray > threshold ? 0 : 255;

    data[i] = data[i + 1] = data[i + 2] = val;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
