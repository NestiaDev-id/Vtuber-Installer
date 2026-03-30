import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export const StepUninstallComplete: React.FC = () => {
  const handleExit = async () => {
    const win = getCurrentWindow();
    await win.close();
  };

  return (
    <div className="flex flex-col h-full items-center justify-center pb-12 relative animate-in fade-in scale-in-95 duration-500">
        <div className="bg-black/10 backdrop-blur-md border border-white/20 p-12 rounded-3xl shadow-2xl text-center max-w-xl">
            <div className="flex justify-center mb-6 text-green-400">
                <CheckCircle2 size={64} />
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                Uninstalled
            </h1>
            <p className="text-lg text-white/50 mb-10">
                VTuber App has been safely removed from your computer.
            </p>

            <button 
                onClick={handleExit}
                className="w-full h-16 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xl transition-all flex items-center justify-center gap-2 group border border-white/10"
            >
                Exit Uninstaller
            </button>
        </div>
    </div>
  );
};
