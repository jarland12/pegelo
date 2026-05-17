import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Keyboard, Check, Loader2, ArrowLeft } from 'lucide-react';
import { registerSticker } from '../modules/storage/collectionService.js';
import { useAppStore } from '../store/useAppStore.js';

export default function ManualPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { triggerRefresh, showToast } = useAppStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) return;
    setIsProcessing(true);
    try {
      await registerSticker(code.trim().toUpperCase());
      triggerRefresh();
      showToast(`¡Lámina ${code.trim().toUpperCase()} agregada!`);
      setCode('');
    } catch (err) {
      setError('Código inválido. Verifica el formato (ej: COL 7)');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 px-1 animate-in fade-in duration-300">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted text-sm font-medium py-2 self-start"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="glass-card flex flex-col gap-6 p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Keyboard size={20} />
          </div>
          <div>
            <h2 className="font-bold text-[18px]">Registro Manual</h2>
            <p className="text-[13px] text-muted">Escribe el código de la lámina</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            autoFocus
            className="w-full bg-card-light rounded-2xl p-5 text-[24px] font-bold text-center tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border"
            placeholder="COL 7"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {error && <div className="text-primary text-[11px] font-bold text-center">{error}</div>}
          <button 
            type="submit"
            disabled={isProcessing}
            className="w-full bg-primary text-white p-5 rounded-3xl font-bold text-[16px] shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Check size={20} />}
            Agregar al Álbum
          </button>
        </form>
      </div>
    </div>
  );
}
