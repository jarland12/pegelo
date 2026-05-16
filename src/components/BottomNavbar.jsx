import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Keyboard, Layers, Star } from 'lucide-react';

export default function BottomNavbar() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center flex-1 py-3 transition-colors ${
        isActive(to) ? 'text-primary' : 'text-muted hover:text-white/80'
      }`}
    >
      <Icon size={22} strokeWidth={isActive(to) ? 2.5 : 2} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto z-50 bg-card border-t border-border px-2 pb-6 pt-2">
      <div className="flex justify-around items-center">
        <NavItem to="/" icon={Home} label="Inicio" />
        <NavItem to="/album" icon={LayoutGrid} label="Álbum" />
        
        {/* Floating Scan Button */}
        <div className="flex-1 flex justify-center -mt-10">
          <Link 
            to="/manual" 
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_8px_24px_rgba(239,68,68,0.3)] border-[6px] border-bg hover:scale-105 active:scale-95 transition-all"
          >
            <Keyboard size={28} strokeWidth={2.5} />
          </Link>
        </div>

        <NavItem to="/duplicates" icon={Layers} label="Repetidas" />
        <NavItem to="/coca-cola" icon={Star} label="Coca" />
      </div>
    </nav>
  );
}