import Dexie from 'dexie';

export const db = new Dexie('PaniniAlbum2026');

db.version(1).stores({
  collection: 'code, teamCode, count, addedAt, updatedAt',
});

const BACKUP_KEY = 'panini-album-backup';
const DEBOUNCE_DELAY = 500;

let debounceTimer = null;

export function saveToLocalStorage() {
  if (debounceTimer) clearTimeout(debounceTimer);
  
  debounceTimer = setTimeout(async () => {
    try {
      const allData = await db.collection.toArray();
      localStorage.setItem(BACKUP_KEY, JSON.stringify(allData));
    } catch (e) {
      console.warn('Failed to save backup to localStorage:', e);
    }
  }, DEBOUNCE_DELAY);
}

export async function loadFromLocalStorage() {
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (!backup) return false;
    
    const existingCount = await db.collection.count();
    if (existingCount > 0) return false;
    
    const data = JSON.parse(backup);
    if (!Array.isArray(data) || data.length === 0) return false;
    
    await db.collection.bulkAdd(data);
    console.log(`Restored ${data.length} stickers from localStorage backup`);
    return true;
  } catch (e) {
    console.warn('Failed to load backup from localStorage:', e);
    return false;
  }
}

export async function exportCollection() {
  const allData = await db.collection.toArray();
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `panini-respaldo-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importCollection(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error('Formato inválido');
  await db.collection.clear();
  await db.collection.bulkAdd(data);
  saveToLocalStorage();
}
