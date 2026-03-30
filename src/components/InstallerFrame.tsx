import React from 'react';
import { X, Minus } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();

interface InstallerFrameProps {
  children: React.ReactNode;
}

export const InstallerFrame: React.FC<InstallerFrameProps> = ({ children }) => {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl bg-slate-900 group">
      {/* Background Image - Anime Sky */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-in-out group-hover:scale-105"
        style={{ 
          backgroundImage: `url('/assets/background.jpg')`,
          filter: 'brightness(0.95)' 
        }}
      />
      
      {/* Subtle Overlay Gradient for text readability at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

      {/* Top Bar (Draggable Area & Controls) */}
      <div 
        data-tauri-drag-region
        className="absolute top-0 left-0 right-0 h-14 flex justify-between items-center px-4 z-50 cursor-default"
      >
        <div className="flex items-center gap-2 text-white/90 drop-shadow-md pointer-events-none">
           <span className="font-bold tracking-wide text-sm opacity-80">VTuber App Installer</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => appWindow.minimize()}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <Minus size={18} />
          </button>
          <button 
            onClick={() => appWindow.close()}
            className="p-2 text-white/80 hover:text-white hover:bg-red-500/80 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Content Layer */}
      <div className="absolute inset-0 z-10 flex flex-col">
        {children}
      </div>
    </div>
  );
};