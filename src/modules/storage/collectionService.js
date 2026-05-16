import { db, saveToLocalStorage } from '../../db/index.js';
import { CATALOG_MAP, CATALOG, TEAMS } from '../../data/catalog.js';

// Registrar o incrementar lámina
export async function registerSticker(code) {
  const existing = await db.collection.get(code);
  const sticker = CATALOG_MAP[code];
  if (!sticker) throw new Error(`Código inválido: ${code}`);
  
  if (existing) {
    await db.collection.update(code, { 
      count: existing.count + 1, 
      updatedAt: new Date().toISOString() 
    });
  } else {
    await db.collection.add({
      code,
      teamCode: sticker.teamCode,
      number: sticker.number,
      count: 1,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  saveToLocalStorage();
}

// Eliminar o decrementar lámina
export async function unregisterSticker(code) {
  const existing = await db.collection.get(code);
  if (!existing) return;
  
  if (existing.count > 1) {
    await db.collection.update(code, { 
      count: existing.count - 1, 
      updatedAt: new Date().toISOString() 
    });
  } else {
    await db.collection.delete(code);
  }
  
  saveToLocalStorage();
}

// Progreso por equipo
export async function getTeamProgress(teamCode) {
  const owned = await db.collection.where('teamCode').equals(teamCode).toArray();
  const teamStickers = CATALOG.filter(s => s.teamCode === teamCode);
  const total = teamStickers.length;
  
  return {
    owned: owned.length,          // láminas distintas que tengo
    total,
    duplicates: owned.filter(s => s.count > 1).length,
    missing: total - owned.length
  };
}

// Progreso global
export async function getGlobalProgress() {
  const all = await db.collection.toArray();
  const mainOwned = all.filter(entry => !CATALOG_MAP[entry.code].isExclusive);
  const total = CATALOG.filter(s => !s.isExclusive).length; // 980
  
  return {
    owned: mainOwned.length,
    total,
    duplicates: mainOwned.filter(s => s.count > 1).length,
    percentage: Math.round((mainOwned.length / total) * 100) || 0
  };
}

// Obtener todas las repetidas
export async function getDuplicates() {
  const all = await db.collection.where('count').above(1).toArray();
  return all.map(entry => {
    const sticker = CATALOG_MAP[entry.code];
    return {
      ...entry,
      ...sticker
    };
  });
}

// Obtener progreso de todos los equipos (para el Álbum)
export const TEAM_ORDER = ["FWC", ...TEAMS.map(t => t.code), "CC"];

export async function getAllTeamsProgress() {
  const allOwned = await db.collection.toArray();
  // Incluimos FWC y CC como "equipos" especiales
  const allTeamCodes = ["FWC", ...TEAMS.map(t => t.code), "CC"];
  
  return allTeamCodes.map(teamCode => {
    const ownedInTeam = allOwned.filter(s => s.teamCode === teamCode);
    const totalInTeam = CATALOG.filter(s => s.teamCode === teamCode).length;
    return {
      teamCode,
      owned: ownedInTeam.length,
      total: totalInTeam,
      percentage: Math.round((ownedInTeam.length / totalInTeam) * 100) || 0
    };
  });
}

// Obtener últimas agregadas
export async function getLatestAdded(limit = 4) {
  const all = await db.collection.orderBy('updatedAt').reverse().limit(limit).toArray();
  return all.map(entry => {
    const sticker = CATALOG_MAP[entry.code];
    return {
      ...entry,
      ...sticker
    };
  });
}

// Obtener equipos cerca de completar (top 4)
export async function getNearCompleteTeams(limit = 4) {
  const progresses = await getAllTeamsProgress();
  return progresses
    .filter(p => p.owned > 0 && p.owned < p.total)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, limit);
}
