import { Link, useLocation } from 'react-router-dom';

export default function TopNavbar() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path || 
    (path === '/' && location.pathname === '') ||
    (path.startsWith('/team/') && location.pathname.startsWith('/team/'));

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-red-500 dark:text-red-400">Panini</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Album</span>
        </div>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6">
          <Link 
            to="/" 
            className={`
              flex flex-col items-center gap-1 text-sm font-medium 
              ${isActive('/') ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}
            `}
          >
            <span className="text-xl">⌂</span>
            <span>Inicio</span>
          </Link>
          
          <Link 
            to="/album" 
            className={`
              flex flex-col items-center gap-1 text-sm font-medium 
              ${isActive('/album') ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}
            `}
          >
            <span className="text-xl">▦</span>
            <span>Álbum</span>
          </Link>
        </nav>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Link 
            to="/scan" 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <img src="/scan.png" alt="Escanear" className="w-6 h-6" />
          </Link>
          
          <Link 
            to="/duplicates" 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-xl">⧉</span>
          </Link>
        </div>
      </div>
    </header>
  );
}