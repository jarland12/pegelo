import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore.js';
import { getGlobalProgress } from '../modules/storage/collectionService.js';

export default function ProgressCard({ teamCode = null }) {
  const [stats, setStats] = useState(null);
  const refreshTrigger = useAppStore(state => state.refreshTrigger);
     
  useEffect(() => {
    async function fetchStats() {
      let statsData;
      if (teamCode) {
        const { getTeamProgress } = await import('../modules/storage/collectionService.js');
        statsData = await getTeamProgress(teamCode);
      } else {
        statsData = await getGlobalProgress();
      }
      setStats(statsData);
    }
    fetchStats();
  }, [refreshTrigger, teamCode]);

  if (!stats) {
    return (
      <div className="glass-card flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const percentage = Math.round((stats.owned / stats.total) * 100) || 0;
    
  return (
    <div className="glass-card">
      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="text-[12px] text-muted mb-1">{teamCode ? `Progreso ${teamCode}` : 'Progreso'}</div>
          <div className="text-[54px] font-bold leading-none tracking-tighter">{percentage}%</div>
        </div>
        <div className="text-right">
          <div className="text-[15px] font-semibold text-text">{stats.owned} / {stats.total}</div>
          <div className="text-[13px] text-muted">láminas</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2.5 bg-card-light rounded-full overflow-hidden mb-5">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-700 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-card-light border border-border rounded-2xl p-3 text-center">
          <strong className="block text-[22px] font-bold text-success mb-0.5">{stats.owned}</strong>
          <div className="text-[11px] text-muted uppercase font-medium">Tengo</div>
        </div>
        <div className="bg-card-light border border-border rounded-2xl p-3 text-center">
          <strong className="block text-[22px] font-bold text-primary mb-0.5">{stats.total - stats.owned}</strong>
          <div className="text-[11px] text-muted uppercase font-medium">Faltan</div>
        </div>
        <div className="bg-card-light border border-border rounded-2xl p-3 text-center">
          <strong className="block text-[22px] font-bold text-warning mb-0.5">{stats.duplicates || 0}</strong>
          <div className="text-[11px] text-muted uppercase font-medium">Repetidas</div>
        </div>
      </div>
    </div>
  );
}
