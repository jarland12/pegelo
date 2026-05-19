import { useEffect, useState } from 'react';
import { unregisterSticker, registerSticker, TEAM_ORDER } from '../modules/storage/collectionService.js';
import { useAppStore } from '../store/useAppStore.js';
import { TEAM_FLAGS } from '../utils/teamConfig.js';
import { Minus, Share2, Copy, CircleDashed, Plus, ChevronDown, Search as SearchIcon } from 'lucide-react';
import { CATALOG_MAP, CATALOG, TEAMS } from '../data/catalog.js';
import { db } from '../db/index.js';

export default function DuplicatesPage() {
  const [allStickers, setAllStickers] = useState([]);
  const [activeTab, setActiveTab] = useState('repetidas');
  const [expandedRepTeam, setExpandedRepTeam] = useState(null);
  const [expandedMissTeam, setExpandedMissTeam] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { refreshTrigger, triggerRefresh, showToast } = useAppStore();

  useEffect(() => {
    async function fetchAllStickers() {
      try {
        const data = await db.collection.toArray();
        setAllStickers(data);
      } catch (error) {
        console.error('Error al obtener stickers:', error);
      }
    }
    fetchAllStickers();
  }, [refreshTrigger]);

  const duplicates = allStickers
    .filter(sticker => sticker.count > 1)
    .map(sticker => ({
      ...sticker,
      ...(CATALOG_MAP[sticker.code] || {})
    }));

  const ownedSet = new Set(
    allStickers
      .filter(sticker => sticker.count > 0)
      .map(sticker => sticker.code)
  );

  const missingByTeam = {};
  TEAM_ORDER.forEach(teamCode => {
    const teamStickers = CATALOG.filter(sticker => sticker.teamCode === teamCode);
    const missing = teamStickers.filter(sticker => !ownedSet.has(sticker.code));
    if (missing.length > 0) {
      missingByTeam[teamCode] = missing;
    }
  });

  const totalDups = duplicates.reduce((acc, curr) => acc + (curr.count - 1), 0);
  const totalMissing = Object.values(missingByTeam).reduce((acc, missing) => acc + missing.length, 0);

  const q = searchQuery.toLowerCase().trim();

  // Filtered views
  const filteredDupsByTeam = {};
  TEAM_ORDER.forEach(teamCode => {
    let teamDups = duplicates.filter(dup => dup.teamCode === teamCode);
    if (q) {
      teamDups = teamDups.filter(s => s.code.toLowerCase().includes(q) || (s.player && s.player.toLowerCase().includes(q)));
    }
    if (teamDups.length > 0) {
      filteredDupsByTeam[teamCode] = teamDups;
    }
  });

  const filteredMissingByTeam = {};
  TEAM_ORDER.forEach(teamCode => {
    let teamMissing = missingByTeam[teamCode] || [];
    if (q) {
      teamMissing = teamMissing.filter(s => s.code.toLowerCase().includes(q) || (s.player && s.player.toLowerCase().includes(q)));
    }
    if (teamMissing.length > 0) {
      filteredMissingByTeam[teamCode] = teamMissing;
    }
  });

  const handleShareDuplicates = async () => {
    if (duplicates.length === 0) return;

    try {
      const shareText = generateShareText(duplicates);

      if (navigator.share) {
        await navigator.share({
          title: 'Láminas repetidas para intercambiar - Álbum 2026',
          text: shareText
        });
        showToast('¡Compartido correctamente!');
      } else {
        await navigator.clipboard.writeText(shareText);
        showToast('¡Copiado al portapapeles! Puedes pegarlo en cualquier app.');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      showToast('Error al compartir. Por favor, intenta nuevamente.');
    }
  };

  const handleShareMissing = async () => {
    if (totalMissing === 0) return;

    try {
      const shareText = generateMissingText(missingByTeam);

      if (navigator.share) {
        await navigator.share({
          title: 'Láminas que me faltan - Álbum 2026',
          text: shareText
        });
        showToast('¡Compartido correctamente!');
      } else {
        await navigator.clipboard.writeText(shareText);
        showToast('¡Copiado al portapapeles! Puedes pegarlo en cualquier app.');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      showToast('Error al compartir. Por favor, intenta nuevamente.');
    }
  };

  const generateShareText = (duplicatesList) => {
    let text = '¡Hola! Tengo estas láminas repetidas para intercambiar en el Álbum 2026:\n\n';

    const byTeam = {};
    duplicatesList.forEach(dup => {
      if (!byTeam[dup.teamCode]) byTeam[dup.teamCode] = [];
      byTeam[dup.teamCode].push(dup);
    });

    TEAM_ORDER.forEach(teamCode => {
      if (byTeam[teamCode] && byTeam[teamCode].length > 0) {
        if (teamCode === 'CC') {
          text += `Coca-Cola\n`;
          byTeam[teamCode].forEach(dup => {
            text += `${dup.code} ${dup.player} ×${dup.count - 1}\n`;
          });
          text += '\n';
        } else {
          const flag = TEAM_FLAGS[teamCode] || '';
          text += `${flag} ${teamCode}\n`;
          byTeam[teamCode].forEach(dup => {
            text += `${dup.code} ${dup.player} ×${dup.count - 1}\n`;
          });
          text += '\n';
        }
      }
    });

    text += '¿Te interesan algunas para intercambiar? #Álbum2026 #Intercambio';

    return text;
  };

  const generateMissingText = (missingByTeamObj) => {
    let text = '¡Hola! Me faltan estas láminas del Álbum 2026:\n\n';

    TEAM_ORDER.forEach(teamCode => {
      if (missingByTeamObj[teamCode] && missingByTeamObj[teamCode].length > 0) {
        if (teamCode === 'CC') {
          text += `Coca-Cola\n`;
          missingByTeamObj[teamCode].forEach(sticker => {
            text += `${sticker.code} ${sticker.player}\n`;
          });
          text += '\n';
        } else {
          const flag = TEAM_FLAGS[teamCode] || '';
          text += `${flag} ${teamCode}\n`;
          missingByTeamObj[teamCode].forEach(sticker => {
            text += `${sticker.code} ${sticker.player}\n`;
          });
          text += '\n';
        }
      }
    });

    text += '¿Tienes alguna para intercambiar? #Álbum2026 #Intercambio';

    return text;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex border-b border-border pb-1">
        <button
          onClick={() => { setActiveTab('repetidas'); setSearchQuery(''); }}
          className={`flex-1 text-center py-2 font-medium 
            ${activeTab === 'repetidas' ? 'text-primary border-b-2 border-primary' : 'text-muted'}`}
        >
          Repetidas
        </button>
        <button
          onClick={() => { setActiveTab('faltan'); setSearchQuery(''); }}
          className={`flex-1 text-center py-2 font-medium 
            ${activeTab === 'faltan' ? 'text-primary border-b-2 border-primary' : 'text-muted'}`}
        >
          Faltan
        </button>
      </div>

      <div className="flex justify-between items-center mb-2.5 px-1">
        <h2
          className="text-[13px] font-normal text-muted"
          style={{ fontSize: '13px', color: '#8b8b8f' }}
        >
          {activeTab === 'repetidas' ? `${totalDups} repetidas` : `${totalMissing} faltantes`}
        </h2>
        {activeTab === 'repetidas' && (
          <button
            onClick={handleShareDuplicates}
            className="text-[12px] text-primary font-bold flex items-center gap-1.5 active:opacity-70 transition-opacity disabled:opacity-50"
            disabled={duplicates.length === 0}
          >
            Compartir <Share2 size={12} />
          </button>
        )}
        {activeTab === 'faltan' && (
          <button
            onClick={handleShareMissing}
            className="text-[12px] text-primary font-bold flex items-center gap-1.5 active:opacity-70 transition-opacity disabled:opacity-50"
            disabled={totalMissing === 0}
          >
            Compartir <Share2 size={12} />
          </button>
        )}
      </div>

      <div className="px-1 relative mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card-light rounded-2xl p-3 pl-11 pr-4 text-[14px] text-text border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          placeholder={`Buscar en ${activeTab === 'repetidas' ? 'repetidas' : 'faltantes'}...`}
        />
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={18} />
      </div>

      {activeTab === 'repetidas' ? (
        Object.keys(filteredDupsByTeam).length === 0 ? (
          <div className="glass-card p-12 text-center text-muted text-sm italic">
            {q ? 'No se encontraron repetidas.' : 'No tienes láminas repetidas aún.'}
          </div>
        ) : (
          <div className="space-y-2">
            {Object.keys(filteredDupsByTeam).map((teamCode) => {
              const teamDups = filteredDupsByTeam[teamCode];
              const isExpanded = expandedRepTeam === teamCode;

              return (
                <div
                  key={teamCode}
                  style={{
                    border: '1px solid #262626',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: '#161616',
                  }}
                >
                  <div
                    className="flex justify-between items-center"
                    style={{
                      backgroundColor: '#1a1a1a',
                      padding: '14px 16px',
                      minHeight: '52px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={() => {
                      setExpandedRepTeam(expandedRepTeam === teamCode ? null : teamCode);
                    }}
                  >
                    <div className="font-semibold" style={{ fontSize: '17px', fontWeight: '700', letterSpacing: '0.05em' }}>
                      {teamCode}
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          backgroundColor: '#2a1a1a',
                          color: '#ff9800',
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          letterSpacing: '0.05em',
                          border: '1px solid #2a2010'
                        }}
                      >
                        {teamDups.reduce((acc, dup) => acc + (dup.count - 1), 0)} REP
                      </div>
                      <span style={{ fontSize: '18px', opacity: 0.6 }}>{TEAM_FLAGS[teamCode]}</span>
                      <ChevronDown
                        size={16}
                        style={{
                          transition: 'transform 0.3s ease',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          color: '#8b8b8f'
                        }}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ backgroundColor: '#1a1a1a' }}>
                      <div className="space-y-0">
                        {teamDups.map((dup, stickerIndex) => (
                          <div
                            key={dup.code}
                            style={{
                              padding: '12px 16px',
                              borderBottom: stickerIndex === teamDups.length - 1 ? 'none' : '1px solid #262626'
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-warning-bg flex items-center justify-center text-warning shrink-0">
                                <Copy size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className="font-semibold text-truncate"
                                  style={{
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    color: '#f5f5f5',
                                    letterSpacing: '0.02em',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {dup.code}
                                </div>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    color: '#8b8b8f',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {dup.player}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await unregisterSticker(dup.code);
                                    triggerRefresh();
                                    showToast(`Removida repetida de ${dup.code}`, async () => {
                                      await registerSticker(dup.code);
                                      triggerRefresh();
                                    });
                                  }}
                                  className="w-8 h-8 rounded-full bg-muted/10 flex items-center justify-center text-muted hover:bg-danger/10 hover:text-danger active:scale-90 transition-all"
                                >
                                  <Minus size={14} />
                                </button>
                                <div className="bg-warning-bg text-warning text-[13px] font-bold px-3 py-1 rounded-full border border-warning/10">
                                  ×{dup.count - 1}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        Object.keys(filteredMissingByTeam).length === 0 ? (
          <div className="glass-card p-12 text-center text-muted text-sm italic">
            {q ? 'No se encontraron faltantes.' : '¡Felicidades! No te faltan láminas.'}
          </div>
        ) : (
          <div className="space-y-2">
            {Object.keys(filteredMissingByTeam).map((teamCode) => {
              const missingStickers = filteredMissingByTeam[teamCode];
              const isExpanded = expandedMissTeam === teamCode;

              return (
                <div
                  key={teamCode}
                  style={{
                    border: '1px solid #262626',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: '#161616',
                  }}
                >
                  <div
                    className="flex justify-between items-center"
                    style={{
                      backgroundColor: '#1a1a1a',
                      padding: '14px 16px',
                      minHeight: '52px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={() => {
                      setExpandedMissTeam(expandedMissTeam === teamCode ? null : teamCode);
                    }}
                  >
                    <div className="font-semibold" style={{ fontSize: '17px', fontWeight: '700', letterSpacing: '0.05em' }}>
                      {teamCode}
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          backgroundColor: '#1a1a1a',
                          color: '#8b8b8f',
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          letterSpacing: '0.05em',
                          border: '1px solid #262626'
                        }}
                      >
                        {missingStickers.length} FALTAN
                      </div>
                      <span style={{ fontSize: '18px', opacity: 0.6 }}>{TEAM_FLAGS[teamCode]}</span>
                      <ChevronDown
                        size={16}
                        style={{
                          transition: 'transform 0.3s ease',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          color: '#8b8b8f'
                        }}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ backgroundColor: '#1a1a1a' }}>
                      <div className="space-y-0">
                        {missingStickers.map((sticker, stickerIndex) => (
                          <div
                            key={sticker.code}
                            style={{
                              padding: '12px 16px',
                              borderBottom: stickerIndex === missingStickers.length - 1 ? 'none' : '1px solid #262626'
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  backgroundColor: '#161616',
                                  border: '1px dashed #333',
                                  borderRadius: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                <CircleDashed size={16} style={{ color: '#444' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className="font-semibold"
                                  style={{
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    color: '#f5f5f5',
                                    letterSpacing: '0.02em',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {sticker.code}
                                </div>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    color: '#8b8b8f',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {sticker.player}
                                </div>
                              </div>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await registerSticker(sticker.code);
                                    if ('vibrate' in navigator) navigator.vibrate(50);
                                    showToast(`${sticker.player} agregado a tu colección!`);
                                    triggerRefresh();
                                  } catch (error) {
                                    console.error('Error:', error);
                                    showToast('Error al agregar la lámina.');
                                  }
                                }}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-muted opacity-30 hover:opacity-60 active:scale-95 transition-all shrink-0"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}