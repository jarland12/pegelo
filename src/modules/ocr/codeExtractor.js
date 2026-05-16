import { CATALOG_MAP, VALID_CODES } from '../../data/catalog.js';
import { findClosestCodes } from '../matching/fuzzyMatch.js';

export function extractCode(rawText) {
  // 1. Limpiar el texto: trim, uppercase, eliminar ruidos comunes
  let clean = rawText.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, '');

  // 2. Extraer patrón con regex: /([A-Z]{2,3})\s?(\d{1,2})/
  // Captura prefijo (2-3 letras) y número (1-2 dígitos)
  const regex = /([A-Z]{2,3})\s?(\d{1,2})/;
  const match = clean.match(regex);

  if (!match) {
    return { code: null, status: 'UNKNOWN', sticker: null, suggestions: [] };
  }

  const prefix = match[1];
  const number = match[2];
  
  // Normalizar el código para búsqueda
  // El catálogo usa espacio para equipos y nada para CC (CC1, CC2...)
  let normalized;
  if (prefix === 'CC') {
    normalized = `CC${number}`;
  } else {
    normalized = `${prefix} ${number}`;
  }

  // 3. Si coincide exacto con catálogo → status: 'EXACT'
  if (CATALOG_MAP[normalized]) {
    return { 
      code: normalized, 
      status: 'EXACT', 
      sticker: CATALOG_MAP[normalized], 
      suggestions: [] 
    };
  }

  // 4. Si no coincide, buscar el más cercano con Levenshtein ≤ 2
  // Usamos findClosestCodes que ya implementa Levenshtein
  const suggestions = findClosestCodes(normalized, VALID_CODES, 3);
  
  // Filtrar por distancia máxima de 2 para considerarlo un "GUESS"
  const bestGuess = suggestions[0];
  if (bestGuess && bestGuess.distance <= 2) {
    return {
      code: bestGuess.code,
      status: 'GUESS',
      sticker: CATALOG_MAP[bestGuess.code],
      suggestions: suggestions
    };
  }

  // 5. Si nada coincide o distancia > 2 → status: 'UNKNOWN'
  return { 
    code: normalized, 
    status: 'UNKNOWN', 
    sticker: null, 
    suggestions: suggestions.slice(0, 3) 
  };
}
