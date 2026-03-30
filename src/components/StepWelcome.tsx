import React, { useState, useEffect } from 'react';
import { ChevronDown, Check, X, FolderOpen } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { InstallConfig } from '../types';
import { LanguageSelector } from './LanguageSelector';
// import { generateReleaseNotes } from "../services/geminiService";

interface StepWelcomeProps {
  onNext: () => void;
  config: InstallConfig;
  setConfig: React.Dispatch<React.SetStateAction<InstallConfig>>;
}

export const StepWelcome: React.FC<StepWelcomeProps> = ({ onNext, config, setConfig }) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [releaseNotes] = useState<string[]>([]);

  useEffect(() => {
    // generateReleaseNotes().then(notes => setReleaseNotes(notes.slice(0, 3)));
  }, []);

  const handleBrowse = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select Installation Directory',
      defaultPath: config.installPath
    });
    
    if (selected && typeof selected === 'string') {
      setConfig({ ...config, installPath: selected });
    }
  };

  const handleInstall = () => {
    if (agreed) onNext();
  };

  return (
    <div className="flex flex-col h-full justify-between pb-12 px-12 pt-20 relative">
      
      {/* Left Side: Release Highlights */}
      <div className="w-[400px] mt-12 space-y-4">
        <h1 className="text-5xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] tracking-tight">
          Into the<br/>Virtual World
        </h1>
        {/* <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-white/10 text-white/90 shadow-lg">
          <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">Version 2.0 Updates</h3>
          <ul className="space-y-2">
            {releaseNotes.length > 0 ? releaseNotes.map((note, i) => (
              <li key={i} className="text-sm flex items-start gap-2 leading-snug shadow-black drop-shadow-sm">
                <span className="text-yellow-400 mt-1">•</span> {note}
              </li>
            )) : (
               <li className="text-sm opacity-70">Loading patch notes...</li>
            )}
          </ul>
        </div> */}
      </div>

      {/* Center Bottom: Action Area */}
      <div className="flex flex-col items-center justify-end w-full max-w-2xl mx-auto relative z-10">
        
        {/* Main Button */}
        <div className="relative group">
          <button 
            onClick={handleInstall}
            disabled={!agreed}
            className={`
              w-64 h-16 rounded-md font-bold text-xl tracking-wide shadow-lg
              transition-all duration-200 transform
              flex items-center justify-center
              ${agreed 
                ? 'bg-[#FFD700] hover:bg-[#FFC800] text-slate-900 scale-100' 
                : 'bg-slate-700 text-slate-400 cursor-not-allowed grayscale'
              }
            `}
          >
            Quick Installation
          </button>
        </div>

        {/* Custom Install Trigger */}
        <div className="mt-4">
             <button 
                onClick={() => setIsCustomOpen(true)}
                className="text-white/80 hover:text-[#FFD700] text-sm flex items-center gap-1 transition-colors drop-shadow-md font-medium"
             >
                Custom Installation 
             </button>
        </div>
      </div>

      {/* Custom Installation Modal */}
      {isCustomOpen && (
        <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsCustomOpen(false)}
        >
            <div 
                className="w-[520px] bg-[#232836] border border-white/10 rounded-xl shadow-2xl p-8 text-white relative animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold text-[#FFD700]">Installation Settings</h3>
                    <button 
                        onClick={() => setIsCustomOpen(false)}
                        className="text-white/50 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-8">
                    {/* Path Input */}
                    <div>
                        <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide font-semibold">Installation Path</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1 group">
                                <input 
                                    type="text" 
                                    value={config.installPath}
                                    onChange={(e) => setConfig({...config, installPath: e.target.value})}
                                    className="w-full bg-[#15171e] border border-white/10 rounded px-4 py-3 text-sm text-white/90 outline-none focus:border-[#FFD700] transition-colors"
                                />
                            </div>
                            <button 
                                onClick={handleBrowse}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-white/70 hover:text-white transition-colors flex items-center justify-center"
                            >
                                <FolderOpen size={18} />
                            </button>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-white/40 font-medium">
                             <span className="text-[#FFD700]">Required Space: 2.5GB</span>
                             <span>Available Space: 512GB</span>
                        </div>
                    </div>
                    
                    {/* Checkboxes */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.createDesktopShortcut ? 'bg-[#FFD700] border-[#FFD700]' : 'border-white/30 group-hover:border-white/50'}`}>
                                {config.createDesktopShortcut && <Check size={14} className="text-black stroke-[3]" />}
                            </div>
                            <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={config.createDesktopShortcut}
                                onChange={(e) => setConfig({...config, createDesktopShortcut: e.target.checked})}
                            />
                            <span className="text-sm text-white/80 group-hover:text-white">Create Desktop Shortcut</span>
                        </label>

                       
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-10 flex justify-end">
                    <button 
                        onClick={() => setIsCustomOpen(false)}
                        className="px-8 py-2.5 bg-[#FFD700] hover:bg-[#FFC800] text-[#232836] font-bold rounded text-sm transition-all shadow-lg hover:shadow-[#FFD700]/20"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Bottom Footer: Agreements & Language */}
      <div className="absolute bottom-6 left-8 flex items-center gap-6 text-sm text-white/80">
         <label className="flex items-center gap-2 cursor-pointer group select-none">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${agreed ? 'border-[#FFD700] bg-[#FFD700]' : 'border-white/50 group-hover:border-white'}`}>
                {agreed && <Check size={14} className="text-black font-bold" />}
            </div>
            <input 
                type="checkbox" 
                className="hidden" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="drop-shadow-sm">I have read and agree to the <span className="text-[#FFD700] hover:underline">Terms of Service</span> and <span className="text-[#FFD700] hover:underline">Privacy Policy</span></span>
         </label>
      </div>

      <div className="absolute bottom-6 right-8">
          <LanguageSelector />
      </div>
    </div>
  );
};