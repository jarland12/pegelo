import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CATALOG, TEAMS } from '../data/catalog.js';
import { db } from '../db/index.js';
import { useAppStore } from '../store/useAppStore.js';
import { getTeamProgress, registerSticker, unregisterSticker, TEAM_ORDER } from '../modules/storage/collectionService.js';
import { TEAM_FLAGS } from '../utils/teamConfig.js';
import { Check, Copy, Star } from 'lucide-react';


export default function TeamPage() {
  const { teamCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [stickers, setStickers] = useState([]);
  const [ownedMap, setOwnedMap] = useState({});
  const [progress, setProgress] = useState(null);
  const { refreshTrigger, triggerRefresh } = useAppStore();
  
  // Highlighting state (from Search)
  const [highlightedSticker, setHighlightedSticker] = useState(null);

  // Animation state
  const prevIndexRef = useRef(TEAM_ORDER.indexOf(teamCode));
  const [animationClass, setAnimationClass] = useState('');

  // Handle Highlighting and Scrolling
  useEffect(() => {
    if (location.hash && stickers.length > 0) {
      const stickerId = location.hash.substring(1); // e.g. "sticker-COL-7"
      const stickerCode = stickerId.replace('sticker-', '').replace('-', ' ');
      
      setHighlightedSticker(stickerCode);
      
      // Give some time for the team page to render before scrolling
      const timer = setTimeout(() => {
        const element = document.getElementById(stickerId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);

      const clearTimer = setTimeout(() => setHighlightedSticker(null), 3000);
      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [location.hash, stickers]);
  
  useEffect(() => {
    const currentIndex = TEAM_ORDER.indexOf(teamCode);
    if (currentIndex > prevIndexRef.current) {
      setAnimationClass('animate-slide-in-right');
    } else if (currentIndex < prevIndexRef.current) {
      setAnimationClass('animate-slide-in-left');
    }
    prevIndexRef.current = currentIndex;
  }, [teamCode]);

  // Pointer-based Gestures (Swipe & Long Press)
  const [pointerStart, setPointerStart] = useState(null);
  const lastTapRef = useRef({ time: 0, code: null });
  const minSwipeDistance = 60;
  const longPressDelay = 500; // Slightly faster
  const moveThreshold = 20; // More forgiving for "shaky" long presses

  const onPointerDown = (e, stickerCode = null) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    setPointerStart({ x: startX, y: startY, time: Date.now(), stickerCode });

    if (stickerCode) {
      const timer = setTimeout(() => {
        handleLongPress(stickerCode);
        setPointerStart(null); // Clear to prevent double trigger or swipe
      }, longPressDelay);
      e.currentTarget.dataset.timer = timer;
    }
  };

  const onPointerUp = (e) => {
    e.stopPropagation();
    if (!pointerStart) return;
    
    const deltaX = e.clientX - pointerStart.x;
    const deltaY = e.clientY - pointerStart.y;
    const duration = Date.now() - pointerStart.time;

    // Clear long press timer
    if (e.currentTarget.dataset.timer) {
      clearTimeout(parseInt(e.currentTarget.dataset.timer));
    }

    // Check for Swipe
    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < minSwipeDistance && duration < 300) {
      const currentIndex = TEAM_ORDER.indexOf(teamCode);
      if (deltaX < 0 && currentIndex < TEAM_ORDER.length - 1) {
        navigate(`/team/${TEAM_ORDER[currentIndex + 1]}`);
      } else if (deltaX > 0 && currentIndex > 0) {
        navigate(`/team/${TEAM_ORDER[currentIndex - 1]}`);
      }
    } else if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30 && duration < 400 && pointerStart.stickerCode) {
      const code = pointerStart.stickerCode;
      const now = Date.now();
      if (lastTapRef.current.code === code && (now - lastTapRef.current.time) < 500) {
        lastTapRef.current = { time: 0, code: null }; // reset
        handleDoubleTap(code);
      } else {
        lastTapRef.current = { time: now, code };
      }
    }
    
    setPointerStart(null);
  };

  const handleDoubleTap = async (stickerCode) => {
    const entry = ownedMap[stickerCode];
    if (entry && entry.count > 0) {
      if ('vibrate' in navigator) navigator.vibrate(30);
      await unregisterSticker(stickerCode);
      triggerRefresh();
    }
  };

  const onPointerMove = (e) => {
    e.stopPropagation();
    if (!pointerStart) return;
    
    const deltaX = Math.abs(e.clientX - pointerStart.x);
    const deltaY = Math.abs(e.clientY - pointerStart.y);

    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      if (e.currentTarget.dataset.timer) {
        clearTimeout(parseInt(e.currentTarget.dataset.timer));
      }
    }
  };

  // Long Press Logic
  const handleLongPress = async (stickerCode) => {
    if ('vibrate' in navigator) navigator.vibrate(50);
    await registerSticker(stickerCode);
    triggerRefresh();
  };

  useEffect(() => {
    const teamStickers = CATALOG.filter(s => s.teamCode === teamCode);
    setStickers(teamStickers);

    async function loadData() {
      const owned = await db.collection.where('teamCode').equals(teamCode).toArray();
      const map = {};
      owned.forEach(item => {
        map[item.code] = item;
      });
      setOwnedMap(map);
      
      const p = await getTeamProgress(teamCode);
      setProgress(p);

      if (p.owned === p.total && p.total > 0 && !sessionStorage.getItem(`confetti_${teamCode}`)) {
        sessionStorage.setItem(`confetti_${teamCode}`, 'true');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 9999
        });
      }
    }
    loadData();
  }, [teamCode, refreshTrigger]);

  if (!stickers.length) return <div className="p-12 text-center text-muted">Equipo no encontrado.</div>;

  return (
      <div 
        key={teamCode}
        className={`space-y-1 pb-10 outline-none touch-pan-y ${animationClass}`}
        onPointerDown={(e) => onPointerDown(e)}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
      >
       {/* Team Header Info */}
       {progress && (
         <div className="flex items-center gap-3 bg-card rounded-3xl p-3 border border-border">
           <span className="text-[34px] leading-none">{TEAM_FLAGS[teamCode]}</span>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[18px] font-bold">{teamCode}</span>
              <span className="text-[13px] font-bold text-primary">{Math.round((progress.owned / progress.total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-card-light rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${(progress.owned / progress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

        {/* Grid */}
        <div className="grid grid-cols-4 gap-x-1.5 gap-y-0.5">
        {stickers.map((sticker) => {
          const entry = ownedMap[sticker.code];
          const isOwned = !!entry;
          const isDuplicate = entry && entry.count > 1;
          const isSpecial = sticker.isFoil || sticker.teamCode === 'CC' || sticker.teamCode === 'FWC';
          const isTargeted = highlightedSticker === sticker.code;
          
          let statusClasses = 'bg-card-light border-border/50 border-dashed text-muted/30';
          if (isOwned) {
            if (isSpecial) {
              statusClasses = 'bg-accent-bg border-accent/10 text-accent';
            } else if (isDuplicate) {
              statusClasses = 'bg-warning-bg border-warning/10 text-warning';
            } else {
              statusClasses = 'bg-success-bg border-success/10 text-success';
            }
          }

          if (isTargeted) {
            statusClasses = 'animate-highlight ring-2 ring-primary border-primary z-10 shadow-lg';
          }

          const CellContent = (
            <div 
              id={`sticker-${sticker.code.replace(' ', '-')}`}
              onPointerDown={(e) => onPointerDown(e, sticker.code)}
              onPointerUp={onPointerUp}
              onPointerMove={onPointerMove}
              className={`
                aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all active:scale-95 touch-none select-none
                ${statusClasses}
              `}
            >
              {isOwned && (
                <div className="absolute top-1.5 right-1.5">
                  {isDuplicate ? (
                    <div className="bg-warning text-warning-bg text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {entry.count - 1}
                    </div>
                  ) : (
                    !isSpecial && <Check className="text-success" size={10} strokeWidth={4} />
                  )}
                </div>
              )}
              
              <span className="text-[16px] font-black tracking-tighter">
                {sticker.number}
              </span>
              
              {isSpecial && (
                <Star 
                  size={10} 
                  className={`mt-0.5 ${isOwned ? 'text-accent fill-accent' : 'text-muted/10'}`} 
                />
              )}
            </div>
          );

          const isFwc = sticker.teamCode === 'FWC';
          const isFoilCard = isFwc || sticker.isFoil;

          if (isFoilCard && !isOwned) {
            return (
              <div key={sticker.code} className="shimmer-foil rounded-xl">
                {CellContent}
              </div>
            );
          }
          if (isFoilCard && isOwned) {
            return (
              <div key={sticker.code} className="foil-owned-wrapper">
                {CellContent}
              </div>
            );
          }
          return <div key={sticker.code}>{CellContent}</div>;
        })}
      </div>

       {/* Legend */}
       <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-1 border-t border-border/30 pt-4">
        <LegendItem color="bg-success" label="Tengo" />
        <LegendItem color="bg-warning" label="Repetida" />
        <LegendItem color="bg-card-light border-muted" label="Falta" icon={<div className="w-2.5 h-2.5 rounded border border-dashed border-muted" />} />
        <LegendItem color="bg-accent" label="CROMADA" />
      </div>
    </div>
  );
}

function LegendItem({ color, label, icon }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon ? icon : <div className={`w-2.5 h-2.5 rounded ${color}`} />}
      <span className="text-[11px] text-muted font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
}
