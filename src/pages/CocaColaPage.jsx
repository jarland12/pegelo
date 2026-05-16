import { useEffect, useState } from 'react';
import { db } from '../db/index.js';
import { CATALOG } from '../data/catalog.js';
import { useAppStore } from '../store/useAppStore.js';
import { Plus, Check } from 'lucide-react';
import { registerSticker, unregisterSticker } from '../modules/storage/collectionService.js';

export default function CocaColaPage() {
  const [owned, setOwned] = useState([]);
  const { refreshTrigger, triggerRefresh } = useAppStore();
  const cocaStickers = CATALOG.filter(s => s.teamCode === 'CC');

  useEffect(() => {
    async function fetchOwned() {
      const data = await db.collection.where('teamCode').equals('CC').toArray();
      setOwned(data.map(d => d.code));
    }
    fetchOwned();
  }, [refreshTrigger]);

  const handleToggle = async (code, isCurrentlyOwned) => {
    try {
      if (isCurrentlyOwned) {
        await unregisterSticker(code);
      } else {
        await registerSticker(code);
      }
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const percentage = Math.round((owned.length / cocaStickers.length) * 100) || 0;

  return (
    <div className="bg-gradient-to-br from-[#dc2626] to-[#7f1d1d] rounded-[32px] p-6 pb-24 text-white min-h-[400px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-[13px] opacity-70 mb-1">Progreso</div>
          <div className="text-[42px] font-bold leading-none tracking-tighter">{percentage}%</div>
        </div>
        <div className="bg-white/15 backdrop-blur-md px-3 py-2 rounded-xl text-[13px] font-bold">
          {owned.length} / {cocaStickers.length}
        </div>
      </div>
      
      <div className="h-2.5 bg-white/20 rounded-full overflow-hidden mb-8">
        <div 
          className="h-full bg-white opacity-90 rounded-full transition-all duration-700" 
          style={{ width: `${percentage}%` }} 
        />
      </div>

      <div className="space-y-2.5">
        {cocaStickers.map((s) => {
          const isOwned = owned.includes(s.code);
          return (
            <div 
              key={s.code} 
              onClick={() => handleToggle(s.code, isOwned)}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 px-4 flex justify-between items-center border border-white/5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] opacity-70 font-medium">{s.code}</span>
                <span className="text-[14px] font-bold">{s.player}</span>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isOwned ? 'bg-white text-primary' : 'border border-white/20 text-white/40'
              }`}>
                {isOwned ? <Check className="animate-pop" size={16} strokeWidth={3} /> : <Plus size={14} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}