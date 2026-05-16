export function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  matrix[0] = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = a[j - 1] === b[i - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
    }
  }
  return matrix[b.length][a.length];
}

export function findClosestCodes(rawText, validCodes, topN = 3) {
  if (!rawText) return [];
  return validCodes
    .map(code => ({ code, distance: levenshtein(rawText.toUpperCase(), code) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, topN);
}
