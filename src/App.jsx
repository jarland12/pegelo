import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import HomePage from './pages/HomePage.jsx';
import AlbumPage from './pages/AlbumPage.jsx';
import ScanPage from './pages/ScanPage.jsx';
import DuplicatesPage from './pages/DuplicatesPage.jsx';
import CocaColaPage from './pages/CocaColaPage.jsx';
import ManualPage from './pages/ManualPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import BottomNavbar from './components/BottomNavbar.jsx';
import Toast from './components/Toast.jsx';
import Search from './components/Search.jsx';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isTeamPage = location.pathname.startsWith('/team/');
  const isScanPage = location.pathname === '/scan';
  const isDuplicatesPage = location.pathname === '/duplicates';
  const showBack = isTeamPage || isScanPage;

  const getTitle = () => {
    if (isTeamPage) return location.pathname.split('/').pop();
    switch (location.pathname) {
      case '/': return 'Mi colección';
      case '/album': return 'Álbum';
      case '/duplicates': return 'Repetidas';
      case '/coca-cola': return 'Coca-Cola';
      case '/scan': return 'Escanear';
      case '/manual': return 'Registro Manual';
      default: return 'Álbum 2026';
    }
  };

  return (
    <header className="header p-6 pb-4 bg-card border-b border-border shrink-0 z-40">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-[12px] text-muted mb-0.5">Álbum 2026</div>
          <div className="flex items-center gap-2">
            {showBack && (
              <button 
                onClick={() => navigate(-1)}
                className="text-primary hover:bg-primary/10 rounded-lg p-1 -ml-1 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="text-[26px] font-bold leading-tight">{getTitle()}</h1>
          </div>
        </div>
        <button 
          onClick={() => navigate('/scan')}
          className="bg-primary text-white rounded-2xl px-4 py-2.5 font-semibold text-[13px] mt-0.5 active:scale-95 transition-transform shadow-lg shadow-primary/20"
        >
          Escanear
        </button>
      </div>
      {!isScanPage && !isDuplicatesPage && (
        <div className="relative">
          <Search />
        </div>
      )}
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen bg-bg text-text max-w-[420px] mx-auto shadow-2xl relative overflow-hidden font-sans border-x border-border/50">
        <Header />
        
        <main className="flex-1 overflow-y-auto px-5 pt-5 pb-24 scrollbar-hide">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/album" element={<AlbumPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/duplicates" element={<DuplicatesPage />} />
            <Route path="/coca-cola" element={<CocaColaPage />} />
            <Route path="/manual" element={<ManualPage />} />
            <Route path="/team/:teamCode" element={<TeamPage />} />
          </Routes>
        </main>

        <BottomNavbar />
        <Toast />
      </div>
    </BrowserRouter>
  );
}

export default App;
