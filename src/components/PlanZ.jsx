import { useState } from 'react';
import { useAppStore } from '../store/useAppStore.js';
import { exportCollection, importCollection } from '../db/index.js';

export default function PlanZ() {
  const [open, setOpen] = useState(false);
  const { showToast, triggerRefresh } = useAppStore();
  const fileRef = useState(null);

  const handleExport = async () => {
    try {
      await exportCollection();
      showToast('Respaldo descargado');
    } catch (e) {
      showToast('Error al exportar');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importCollection(file);
      triggerRefresh();
      showToast('Colección restaurada');
    } catch (err) {
      showToast('Error: archivo inválido');
    }
    e.target.value = '';
  };

  return (
    <div className="text-center py-4">
      <button
        onClick={() => setOpen(!open)}
        className="text-[10px] text-muted/20 hover:text-muted/50 transition-colors"
      >
        Respaldo
      </button>
      {open && (
        <div className="flex items-center justify-center gap-3 mt-2">
          <button
            onClick={handleExport}
            className="text-[10px] text-muted/40 hover:text-muted/70 transition-colors"
          >
            Exportar
          </button>
          <span className="text-muted/15">|</span>
          <label className="text-[10px] text-muted/40 hover:text-muted/70 transition-colors cursor-pointer">
            Importar
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
