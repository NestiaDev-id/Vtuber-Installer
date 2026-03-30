import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface StepUninstallConfirmProps {
  onCancel: () => void;
  onConfirm: (deleteAll: boolean) => void;
  installPath: string;
}

export const StepUninstallConfirm: React.FC<StepUninstallConfirmProps> = ({ onCancel, onConfirm, installPath }) => {
  const [deleteAll, setDeleteAll] = useState(false);

  return (
    <div className="flex flex-col h-full items-center justify-center pb-12 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl text-center max-w-2xl w-full mx-4">
            <div className="flex justify-center mb-6">
                <div className="bg-red-500/20 p-4 rounded-2xl border border-red-500/30">
                    <AlertTriangle className="text-red-400" size={48} />
                </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                Uninstall Application?
            </h1>
            
            <p className="text-white/60 mb-8 leading-relaxed">
                You are about to remove VTuber App from:<br/>
                <code className="text-yellow-400 font-mono text-sm bg-black/30 px-2 py-1 rounded mt-2 inline-block">
                    {installPath}
                </code>
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox" 
                            checked={deleteAll}
                            onChange={(e) => setDeleteAll(e.target.checked)}
                            className="w-6 h-6 rounded-lg bg-black/40 border-white/10 text-yellow-500 focus:ring-yellow-500/50 cursor-pointer appearance-none checked:bg-yellow-500 transition-all"
                        />
                        {deleteAll && <div className="absolute inset-0 flex items-center justify-center text-slate-900 font-bold text-xs pointer-events-none">✓</div>}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-medium group-hover:text-yellow-400 transition-colors">
                            Wipe all user data & assets
                        </span>
                        <span className="text-white/40 text-xs">
                            Removes history, LLM memory, and downloaded characters permanently.
                        </span>
                    </div>
                </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={onCancel}
                    className="h-14 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5"
                >
                    Cancel
                </button>
                <button 
                    onClick={() => onConfirm(deleteAll)}
                    className="h-14 bg-red-500/80 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                    <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />
                    Uninstall
                </button>
            </div>
        </div>
    </div>
  );
};
