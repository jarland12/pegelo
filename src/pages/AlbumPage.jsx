import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTeamsProgress } from '../modules/storage/collectionService.js';
import { TEAM_FLAGS } from '../utils/teamConfig.js';
import { useAppStore } from '../store/useAppStore.js';

export default function AlbumPage() {
  const [teams, setTeams] = useState([]);
  const refreshTrigger = useAppStore(state => state.refreshTrigger);

  useEffect(() => {
    async function fetchTeams() {
      const data = await getAllTeamsProgress();
      setTeams(data);
    }
    fetchTeams();
  }, [refreshTrigger]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center mb-2.5 px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[.08em] text-muted">Todos los equipos</h2>
        <span className="text-[11px] text-muted font-medium">{teams.length} secciones</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {teams.map((team) => (
          <TeamCard key={team.teamCode} team={team} />
        ))}
      </div>
    </div>
  );
}

function TeamCard({ team }) {
  const flag = TEAM_FLAGS[team.teamCode] || "🏳️";
  const isComplete = team.owned === team.total && team.total > 0;
  
  return (
    <Link to={`/team/${team.teamCode}`} className={`glass-card p-4 transition-all active:scale-[0.98] ${isComplete ? 'border-success/30' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[28px] leading-none">{flag}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isComplete ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
        }`}>
          {isComplete ? 'Completo' : `${team.total - team.owned} falta${team.total - team.owned !== 1 ? 'n' : ''}`}
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