import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { RotateCcw, X } from 'lucide-react';

export default function Toast() {
  const { toast, hideToast } = useAppStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(hideToast, 300); // Wait for exit animation
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  return (
    <div 
      className={`
        fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[380px]
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}
      `}
    >
      <div className="bg-text/90 backdrop-blur-xl text-bg p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/10">
        <div className="flex-1 text-[13px] font-medium leading-tight">
          {toast.message}
        </div>
        
        {toast.undoAction && (
          <button 
            onClick={() => {
              toast.undoAction();
              setVisible(false);
              setTimeout(hideToast, 300);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl text-[12px] font-bold transition-colors"
          >
            <RotateCcw size={12} />
            Deshacer
          </button>
        )}

        <button 
          onClick={() => {
            setVisible(false);
            setTimeout(hideToast, 300);
          }}
          className="text-white/40 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
        
        <div 
          className="absolute bottom-0 left-0 h-1 bg-white/20 rounded-full transition-all linear"
          style={{ 
            width: '100%', 
            animation: `toast-progress ${toast.duration}ms linear forwards` 
          }}
        />
      </div>
      
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
