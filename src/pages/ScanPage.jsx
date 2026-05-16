import { useState, useRef, useEffect } from 'react';
import { Camera, Keyboard, Check, AlertCircle, Loader2, Scan, RefreshCw, Save, X } from 'lucide-react';
import { registerSticker } from '../modules/storage/collectionService.js';
import { useAppStore } from '../store/useAppStore.js';
import { useOCR } from '../modules/ocr/useOCR.js';
import { useOpenCV } from '../modules/vision/useOpenCV.js';
import { detectStickers } from '../modules/vision/stickerDetector.js';
import { extractBadgeROI } from '../modules/vision/roiExtractor.js';
import { preprocessForOCR } from '../modules/vision/imagePreprocessor.js';
import { extractCode } from '../modules/ocr/codeExtractor.js';

export default function ScanPage() {
  const [mode, setMode] = useState('camera'); // camera, results, manual
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [manualCode, setManualCode] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const { ready: ocrReady, recognizeMultiple } = useOCR();
  const { ready: cvReady, cv } = useOpenCV();
  const triggerRefresh = useAppStore(state => state.triggerRefresh);

  // Initialize camera
  useEffect(() => {
    if (mode !== 'camera') return;

    let stream = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setErrorMessage("Error de cámara: " + err.message);
      }
    }
    startCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [mode]);

  const handleCapture = async () => {
    if (!videoRef.current || !cvReady || !ocrReady) return;

    setIsProcessing(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // 1. Detect Stickers
      const rects = await detectStickers(canvas, cv);
      if (rects.length === 0) {
        setErrorMessage("No se detectaron láminas. Intenta alejar un poco la cámara.");
        setIsProcessing(false);
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      // 2. Extract ROIs & Preprocess
      const rois = rects.map(rect => {
        const badgeCanvas = extractBadgeROI(canvas, rect);
        return preprocessForOCR(badgeCanvas);
      });

      // 3. Batch OCR
      const rawTexts = await recognizeMultiple(rois);

      // 4. Extract Codes
      const extractedResults = rawTexts.map((text, i) => {
        const res = extractCode(text);
        return {
          id: i,
          rawText: text,
          code: res.code,
          status: res.status,
          sticker: res.sticker,
          suggestions: res.suggestions,
          selected: res.status === 'EXACT'
        };
      });

      setResults(extractedResults);
      setMode('results');
    } catch (err) {
      console.error(err);
      setErrorMessage("Error al procesar: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegisterAll = async () => {
    setIsProcessing(true);
    try {
      const selectedOnes = results.filter(r => r.selected && r.code);
      for (const res of selectedOnes) {
        await registerSticker(res.code);
      }
      triggerRefresh();
      setMode('camera');
      setResults([]);
    } catch (err) {
      setErrorMessage("Error al registrar: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode) return;
    setIsProcessing(true);
    try {
      await registerSticker(manualCode.toUpperCase().trim());
      triggerRefresh();
      setManualCode('');
      setMode('camera');
    } catch (err) {
      setErrorMessage("Código inválido");
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  if (mode === 'results') {
    return (
      <div className="flex flex-col h-full gap-4 px-1 animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center px-2">
          <div>
            <h2 className="text-lg font-bold">Láminas Detectadas</h2>
            <p className="text-xs text-muted">Confirma las que deseas registrar</p>
          </div>
          <button onClick={() => setMode('camera')} className="p-2 hover:bg-card-light rounded-full transition-colors">
            <X size={20} className="text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pb-24">
          {results.map((res) => (
            <div 
              key={res.id} 
              onClick={() => res.code && setResults(results.map(r => r.id === res.id ? {...r, selected: !r.selected} : r))}
              className={`glass-card p-4 flex items-center gap-4 border-2 transition-all ${
                res.selected ? 'border-primary' : 'border-transparent opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                res.status === 'EXACT' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
              }`}>
                {res.code?.split(' ')[1] || '?'}
              </div>
              <div className="flex-1">
                <div className="font-bold">{res.code || 'No reconocido'}</div>
                <div className="text-[11px] text-muted uppercase tracking-wider">
                  {res.sticker?.player || (res.status === 'GUESS' ? `¿${res.suggestions[0]?.code}?` : 'Toca para editar')}
                </div>
              </div>
              {res.selected ? <Check className="text-primary" /> : <div className="w-6 h-6 rounded-full border-2 border-muted/20" />}
            </div>
          ))}
        </div>

        <div className="fixed bottom-24 left-4 right-4 z-50">
          <button 
            onClick={handleRegisterAll}
            disabled={!results.some(r => r.selected) || isProcessing}
            className="w-full bg-primary text-white p-5 rounded-3xl font-bold text-[16px] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Registrar {results.filter(r => r.selected).length} lámina(s)
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'manual') {
    return (
      <div className="flex flex-col h-full gap-6 px-1 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="glass-card flex flex-col gap-6 p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Keyboard size={20} />
            </div>
            <div>
              <h2 className="font-bold text-[18px]">Ingreso Manual</h2>
              <p className="text-[13px] text-muted">Escribe el código de la lámina</p>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <input 
              autoFocus
              className="w-full bg-card-light rounded-2xl p-5 text-[24px] font-bold text-center tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border"
              placeholder="COL 7"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
            />
            {errorMessage && <div className="text-primary text-[11px] font-bold text-center">{errorMessage}</div>}
            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full bg-primary text-white p-5 rounded-3xl font-bold text-[16px] shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : 'Agregar al Álbum'}
            </button>
          </form>
        </div>

        <button onClick={() => setMode('camera')} className="text-muted text-sm font-medium py-2 flex items-center justify-center gap-2">
          <Camera size={16} /> Volver al Escáner
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 px-1 animate-in fade-in duration-300">
      <div className="bg-card-light rounded-4xl aspect-[3/4] border-4 border-border overflow-hidden relative shadow-2xl">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        
        {/* Scanning Animation */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="w-full h-1/3 bg-gradient-to-b from-primary/20 to-transparent absolute top-0 animate-scan-beam" />
          <div className="absolute inset-8 border-2 border-white/20 rounded-3xl border-dashed" />
        </div>

        {(!cvReady || !ocrReady) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-50">
            <Loader2 className="animate-spin text-primary" size={40} />
            <div className="text-center">
              <div className="text-white font-bold uppercase tracking-widest text-sm mb-1">
                {!cvReady ? 'Iniciando Vision Engine...' : 'Cargando OCR...'}
              </div>
              <div className="text-muted text-[10px]">Prepara tus láminas reverso hacia arriba</div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="absolute top-4 left-4 right-4 bg-primary/95 text-white p-4 rounded-2xl text-[12px] font-bold animate-in fade-in slide-in-from-top-2 z-50 flex items-center gap-2">
            <AlertCircle size={16} /> {errorMessage}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <button 
          onClick={handleCapture}
          disabled={isProcessing || !cvReady || !ocrReady}
          className="w-full bg-primary text-white p-6 rounded-full font-black text-[18px] shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <Scan size={24} />}
          {isProcessing ? 'PROCESANDO...' : 'CAPTURAR LÁMINAS'}
        </button>

        <button 
          onClick={() => setMode('manual')}
          className="w-full text-muted text-sm font-bold flex items-center justify-center gap-2 py-2"
        >
          <Keyboard size={18} /> INGRESO MANUAL
        </button>
      </div>
    </div>
  );
}