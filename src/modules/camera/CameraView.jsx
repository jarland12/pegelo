import { useCamera } from './useCamera.js';

export default function CameraView({ onCapture, children }) {
  const { videoRef, error } = useCamera();

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 border border-gray-700 rounded-xl m-4">
        <p className="text-red-400 text-center px-4">
          No se pudo acceder a la cámara. <br/><span className="text-sm mt-2 block text-gray-500">¿Diste permisos?</span>
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[3/4] bg-black overflow-hidden flex items-center justify-center rounded-xl shadow-xl border border-gray-800">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className="w-full h-full object-cover"
      />
      
      {children}
      
      <button 
        onClick={() => {
          if (videoRef.current) {
            onCapture(videoRef.current);
          }
        }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg border border-blue-400 transition-colors z-20 flex items-center gap-2"
      >
        <span className="w-5 h-5 bg-white rounded-full block border-2 border-blue-600"></span>
        Capturar
      </button>
    </div>
  );
}
