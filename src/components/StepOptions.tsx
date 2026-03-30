import React, { useState } from 'react';
import { FolderOpen, HardDrive, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { InstallConfig } from '../../types';

interface StepOptionsProps {
  config: InstallConfig;
  setConfig: React.Dispatch<React.SetStateAction<InstallConfig>>;
  onNext: () => void;
  onBack: () => void;
}

export const StepOptions: React.FC<StepOptionsProps> = ({ config, setConfig, onNext, onBack }) => {
  const [diskSpace] = useState({ required: 2.5, available: 512.0 }); // Mock data

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({ ...prev, installPath: e.target.value }));
  };

  const toggleDesktop = () => setConfig(prev => ({ ...prev, createDesktopShortcut: !prev.createDesktopShortcut }));
  const toggleStartMenu = () => setConfig(prev => ({ ...prev, createStartMenuShortcut: !prev.createStartMenuShortcut }));

  return (
    <div className="flex w-full h-full">
      {/* Sidebar - Progress Steps */}
      <div className="w-1/4 bg-slate-900 border-r border-slate-800 p-8 flex flex-col gap-6">
        <div className="flex items-center gap-3 text-slate-500">
            <div className="w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center text-xs">1</div>
            <span className="text-sm font-medium">Welcome</span>
        </div>
        <div className="flex items-center gap-3 text-violet-400">
            <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500 flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-sm font-medium">Options</span>
        </div>
         <div className="flex items-center gap-3 text-slate-500">
            <div className="w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center text-xs">3</div>
            <span className="text-sm font-medium">Install</span>
        </div>
         <div className="flex items-center gap-3 text-slate-500">
            <div className="w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center text-xs">4</div>
            <span className="text-sm font-medium">Finish</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-12 flex flex-col">
        <div className="flex-1 space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Installation Options</h2>
                <p className="text-slate-400 text-sm">Configure where and how VTuber Studio is installed.</p>
            </div>

            {/* Path Selection */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300 block">Destination Folder</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={config.installPath} 
                            onChange={handlePathChange}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors">
                        <FolderOpen size={18} />
                    </button>
                </div>
                
                {/* Disk Space Info */}
                <div className="flex items-center gap-6 mt-4 p-4 bg-slate-800/30 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                            <HardDrive className="text-violet-400 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Space Required</p>
                            <p className="text-sm font-medium text-slate-200">{diskSpace.required} GB</p>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-slate-700" />
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Space Available</p>
                            <p className="text-sm font-medium text-emerald-400">{diskSpace.available} GB</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shortcuts */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-medium text-slate-300">Additional Tasks</h3>
                <div className="space-y-3">
                    <label 
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/50 cursor-pointer transition-colors"
                        onClick={toggleDesktop}
                    >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.createDesktopShortcut ? 'bg-violet-600 border-violet-600' : 'border-slate-600 bg-slate-800'}`}>
                            {config.createDesktopShortcut && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-300">Create a desktop shortcut</span>
                    </label>

                    <label 
                         className="flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/50 cursor-pointer transition-colors"
                         onClick={toggleStartMenu}
                    >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.createStartMenuShortcut ? 'bg-violet-600 border-violet-600' : 'border-slate-600 bg-slate-800'}`}>
                            {config.createStartMenuShortcut && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-300">Create a start menu entry</span>
                    </label>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-800">
            <button 
                onClick={onBack}
                className="flex items-center px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
                <ChevronLeft className="mr-1 w-4 h-4" /> Back
            </button>
            <button 
                onClick={onNext}
                className="group relative inline-flex items-center justify-center px-8 py-3 font-medium text-white transition-all duration-200 bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-slate-900"
            >
                Install
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>
    </div>
  );
};
