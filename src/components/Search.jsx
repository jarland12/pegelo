import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Users, User, X } from 'lucide-react';
import { CATALOG, TEAMS } from '../data/catalog.js';
import { TEAM_FLAGS } from '../utils/teamConfig.js';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ teams: [], stickers: [] });
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ teams: [], stickers: [] });
      setIsOpen(false);
      return;
    }

    const q = query.toLowerCase().trim();
    
    // Filter Teams
    const filteredTeams = TEAMS.filter(t => t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map(t => ({ code: t.code, flag: t.flag }));

    // Filter Stickers
    const filteredStickers = CATALOG.filter(s => 
      s.code.toLowerCase().includes(q) || 
      s.player.toLowerCase().includes(q)
    ).slice(0, 6);

    setResults({ teams: filteredTeams, stickers: filteredStickers });
    setIsOpen(true);
  }, [query]);

  const handleSelect = (type, item) => {
    setIsOpen(false);
    setQuery('');
    
    if (type === 'team') {
      navigate(`/team/${item.code}`);
    } else {
      // Navigate to team and add hash for highlighting
      const hash = `sticker-${item.code.replace(' ', '-')}`;
      navigate(`/team/${item.teamCode}#${hash}`);
    }
  };

  return (
    <div className="relative w-full z-50" ref={searchRef}>
      <div className="relative">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          className="w-full bg-card-light rounded-2xl p-3 pl-11 pr-10 text-[14px] text-text border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" 
          placeholder="Buscar código o jugador..." 
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
        {query && (
          <button 
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (results.teams.length > 0 || results.stickers.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-3 glass-results rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-[350px] overflow-y-auto p-2 scrollbar-hide">
            
            {/* Teams Section */}
            {results.teams.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted/60 flex items-center gap-2">
                  <Users size={12} /> Equipos
                </div>
                {results.teams.map(team => (
                  <button
                    key={team.code}
                    onClick={() => handleSelect('team', team)}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-2xl transition-all text-left group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{team.flag}</span>
                    <span className="font-bold text-[16px] text-text group-hover:text-white">{team.code}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Stickers Section */}
            {results.stickers.length > 0 && (
              <div>
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted/60 flex items-center gap-2 border-t border-white/5 pt-3 mt-1">
                  <User size={12} /> Láminas
                </div>
                {results.stickers.map(sticker => (
                  <button
                    key={sticker.code}
                    onClick={() => handleSelect('sticker', sticker)}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-2xl transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-card-light border border-border flex items-center justify-center font-bold text-[13px] text-primary group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
                      {sticker.number}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[15px] leading-tight mb-0.5 text-text group-hover:text-white">{sticker.code}</div>
                      <div className="text-[12px] text-muted line-clamp-1">{sticker.player}</div>
                    </div>
                    {sticker.flag && <span className="text-sm opacity-40 group-hover:opacity-80 transition-opacity">{sticker.flag}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
