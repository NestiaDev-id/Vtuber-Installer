import React, { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Trash2, Terminal } from 'lucide-react';

interface StepUninstallProgressProps {
  onComplete: () => void;
  installPath: string;
  deleteAll: boolean;
  simulate?: boolean;
}

export const StepUninstallProgress: React.FC<StepUninstallProgressProps> = ({ onComplete, installPath, deleteAll, simulate = false }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing Uninstaller...");
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unlistenProgress: () => void;
    let unlistenLogs: () => void;

    const start = async () => {
      try {
        unlistenProgress = await listen<{ percentage: number, current_file: string }>('uninstall-progress', (event) => {
          setProgress(event.payload.percentage);
          setStatus(event.payload.current_file);
        });

        unlistenLogs = await listen<string>('uninstall-log', (event) => {
          setLogs(prev => [...prev, event.payload]);
        });

        await invoke('uninstall_app', { 
            installPath, 
            deleteUserData: deleteAll,
            simulate
        });

        setTimeout(onComplete, 1500); // Give user time to see the last log
      } catch (error) {
        console.error("Uninstall failed:", error);
        setStatus("Error: " + String(error));
        setLogs(prev => [...prev, `ERROR: ${error}`]);
      }
    };

    start();
    return () => {
        unlistenProgress?.();
        unlistenLogs?.();
    };
  }, [installPath, deleteAll, onComplete, simulate]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full items-center justify-center px-12 pb-16 relative animate-in fade-in duration-700">
        {simulate && (
            <div className="absolute top-8 bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse z-20">
                <AlertTriangle size={16} />
                SIMULATION MODE: NO FILES ARE DELETED
            </div>
        )}

        <div className="w-full max-w-3xl flex flex-col h-full mt-12">
            {/* Header Status */}
            <div className="mb-6">
                <div className="flex justify-between text-white/90 text-sm font-medium mb-3">
                    <span className="flex items-center gap-2">
                        <Trash2 size={16} className="text-red-400" />
                        {status}
                    </span>
                    <span>{Math.floor(progress)}%</span>
                </div>
                <div className="h-2 bg-black/40 backdrop-blur-md rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Log Area */}
            <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center gap-2 text-white/40 text-xs font-mono">
                    <Terminal size={12} />
                    UNINSTALL_LOG.TXT
                </div>
                <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {logs.map((log, i) => (
                        <div key={i} className={`mb-1 transition-all duration-300 animate-in fade-in slide-in-from-left-2 ${
                            log.startsWith('Delete') ? 'text-red-300/80' : 
                            log.startsWith('Remove') ? 'text-orange-300/80' : 
                            log.startsWith('---') ? 'text-yellow-400 font-bold' : 'text-white/60'
                        }`}>
                            <span className="text-white/20 mr-2">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                            {log}
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
        </div>
    </div>
  );
};

const AlertTriangle = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);
