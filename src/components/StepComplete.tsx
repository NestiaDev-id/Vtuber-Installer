import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { InstallConfig } from '../types';

interface StepCompleteProps {
  onClose: () => void;
  config: InstallConfig;
}

export const StepComplete: React.FC<StepCompleteProps> = ({ onClose, config }) => {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      await invoke('launch_app', { installPath: config.installPath });
      setTimeout(onClose, 1000); // Give it a moment before closing installer
    } catch (error) {
      console.error("Failed to launch:", error);
      setIsLaunching(false);
      alert("Failed to launch application: " + String(error));
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center pb-12 relative animate-in fade-in zoom-in duration-500">
        <div className="bg-black/10 backdrop-blur-md border border-white/20 p-12 rounded-2xl shadow-2xl text-center max-w-xl">
            <h1 className="text-5xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] mb-4 tracking-tight">
                Ready to Dive In
            </h1>
            <p className="text-lg text-white/70 drop-shadow-md mb-10">
                Installation successful! Your virtual adventure starts now.
            </p>

            <button 
                onClick={handleLaunch}
                disabled={isLaunching}
                className="w-full h-16 bg-[#FFD700] hover:bg-[#FFC800] hover:scale-105 active:scale-95 text-slate-900 rounded-xl font-bold text-xl tracking-wide shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:scale-100"
            >
                <Play fill="currentColor" size={24} className="group-hover:translate-x-1 transition-transform" />
                {isLaunching ? "Launching..." : "Launch Application"}
            </button>
        </div>
        
        <p className="absolute bottom-8 text-white/40 text-xs font-medium uppercase tracking-[0.2em]">
            VTuber App Installer v1.0
        </p>
    </div>
  );
};