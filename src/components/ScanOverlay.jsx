export default function ScanOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-hidden">
      <div 
        className="absolute border-2 border-yellow-400 flex flex-col justify-end"
        style={{
          left: '72%',
          top: '2%',
          width: '26%',
          height: '18%',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)'
        }}
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[120px] text-center text-[10px] text-yellow-400 font-bold bg-gray-900/80 px-2 py-1 rounded">
          ↑ ESPACIO NEGRO
        </div>
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white -translate-x-0.5 -translate-y-0.5" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white translate-x-0.5 -translate-y-0.5" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white -translate-x-0.5 translate-y-0.5" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white translate-x-0.5 translate-y-0.5" />
      </div>
    </div>
  );
}
