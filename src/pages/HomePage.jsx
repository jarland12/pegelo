import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Star } from 'lucide-react';
import ProgressCard from '../components/ProgressCard.jsx';
import { getLatestAdded, getNearCompleteTeams } from '../modules/storage/collectionService.js';
import { useAppStore } from '../store/useAppStore.js';
import { TEAM_FLAGS } from '../utils/teamConfig.js';
import PlanZ from '../components/PlanZ.jsx';

export default function HomePage() {
  const [latest, setLatest] = useState([]);
  const [nearComplete, setNearComplete] = useState([]);
  const refreshTrigger = useAppStore(state => state.refreshTrigger);

  useEffect(() => {
    async function fetchData() {
      const latestData = await getLatestAdded(3);
      const nearData = await getNearCompleteTeams(4);
      setLatest(latestData);
      setNearComplete(nearData);
    }
    fetchData();
  }, [refreshTrigger]);

  return (
    <div className="space-y-6 pb-20">
      <ProgressCard />
      
      {latest.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-2.5 px-1">
            <h2 className="text-[11px] font-semibold uppercase tracking-[.08em] text-muted">Últimas agregadas</h2>
            <span className="text-[11px] text-muted font-medium">Reciente</span>
          </div>
          <div className="list-container">
            {latest.map((item) => (
              <div key={item.code} className="flex justify-between items-center px-4 py-4 border-b border-border last:border-none">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.count > 1 ? 'bg-warning-bg text-warning' : 'bg-success-bg text-success'
                  }`}>
                    {item.count > 1 ? <Copy size={16} /> : <Check size={16} />}
                  </div>
                  <span className="font-semibold text-[15px]">{TEAM_FLAGS[item.teamCode]} {item.code}</span>
                </div>
                <span className={`text-[13px] font-semibold ${
                  item.count > 1 ? 'text-warning' : 'text-success'
                }`}>
                  {item.count > 1 ? `×${item.count - 1}` : 'Nueva ✓'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {nearComplete.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-2.5 px-1">
            <h2 className="text-[11px] font-semibold uppercase tracking-[.08em] text-muted">Cerca de completar</h2>
            <span className="text-[11px] text-muted font-medium">{nearComplete.length} equipos</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {nearComplete.map((team) => (
              <TeamSmallCard key={team.teamCode} team={team} />
            ))}
          </div>
        </section>
      )}
      
      {latest.length === 0 && nearComplete.length === 0 && (
        <div className="glass-card p-12 text-center text-muted text-sm italic">
          Tu colección está vacía. ¡Empieza escaneando algunas láminas!
        </div>
      )}
      <PlanZ />
    </div>
  );
}

function TeamSmallCard({ team }) {
  const flag = TEAM_FLAGS[team.teamCode] || "🏳️";
  const missing = team.total - team.owned;
  const isComplete = team.owned === team.total && team.total > 0;
  
  return (
    <Link to={`/team/${team.teamCode}`} className={`glass-card p-4 transition-all active:scale-[0.98] ${isComplete ? 'border-success/30' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[28px] leading-none">{flag}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isComplete ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
        }`}>
          {isComplete ? '¡Completo!' : `${missing} falta${missing !== 1 ? 'n' : ''}`}
        </span>
      </div>
      <div className="text-[17px] font-bold mb-2.5">{team.teamCode}</div>
      <div className="h-1.5 bg-card-light rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-success' : 'bg-primary'}`} 
          style={{ width: `${team.percentage}%` }}
        />
      </div>
    </Link>
  );
}
