import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { InstallConfig } from '../types';

interface StepInstallingProps {
  onComplete: () => void;
  config: InstallConfig;
}

interface ProgressPayload {
  total?: number;
  downloaded?: number;
  current_file?: string;
  percentage: number;
}

const VTUBER_APP_URL = "https://github.com/NestiaDev-id/Vtuber-App/releases/latest/download/vtuber_app.zip";
const CONTENT_PACKAGE_URL = "https://github.com/NestiaDev-id/Vtuber-App/releases/latest/download/content.zip";

export const StepInstalling: React.FC<StepInstallingProps> = ({ onComplete, config }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing...");
  const [detailText, setDetailText] = useState("Preparing environment...");

  useEffect(() => {
    let unlistenDownload: () => void;
    let unlistenExtract: () => void;

    const startInstall = async () => {
      try {
        // 1. Setup Listeners
        unlistenDownload = await listen<ProgressPayload>('download-progress', (event) => {
          setProgress(event.payload.percentage);
          if (event.payload.total) {
            setDetailText(`${(event.payload.downloaded! / 1024 / 1024).toFixed(1)} MB / ${(event.payload.total / 1024 / 1024).toFixed(1)} MB`);
          }
        });

        unlistenExtract = await listen<ProgressPayload>('extract-progress', (event) => {
          setProgress(event.payload.percentage);
          setDetailText(event.payload.current_file || "Unpacking...");
        });

        // 2. Download VTuber App
        setStatusText("Downloading VTuber App...");
        await invoke('download_launcher', { 
            downloadUrl: VTUBER_APP_URL,
            installPath: config.installPath 
        });

        // 3. Download Content Package
        setStatusText("Downloading Content...");
        setProgress(0);
        await invoke('download_launcher', { 
            downloadUrl: CONTENT_PACKAGE_URL,
            installPath: config.installPath 
        });

        // 4. Extract Launcher
        setStatusText("Installing Launcher...");
        await invoke('extract_launcher', { 
            installPath: config.installPath 
        });

        // 5. Finalize (Registry & Uninstaller Copy)
        setStatusText("Finalizing...");
        await invoke('finalize_installation', { 
            installPath: config.installPath 
        });

        setProgress(100);
        setTimeout(onComplete, 800);

      } catch (error) {
        console.error("Installation failed:", error);
        setStatusText("Error: " + String(error));
        setDetailText("Installation failed. Please check logs.");
      }
    };

    startInstall();

    return () => {
      if (unlistenDownload) unlistenDownload();
      if (unlistenExtract) unlistenExtract();
    };
  }, [config, onComplete]);

  return (
    <div className="flex flex-col h-full items-center justify-end pb-24 px-12">
        <div className="w-full max-w-3xl space-y-4 relative z-10">
            <div className="flex justify-between text-white/90 text-sm font-medium drop-shadow-md">
                <span>{statusText}</span>
                <span>{Math.floor(progress)}%</span>
            </div>

            <div className="h-4 bg-black/40 backdrop-blur-md rounded-full overflow-hidden border border-white/10">
                <div 
                    className="h-full bg-[#FFD700] shadow-[0_0_10px_#FFD700] transition-all duration-100 ease-linear relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
                </div>
            </div>

            <div className="flex justify-between text-xs text-white/50">
                <span>{detailText}</span>
                {/* <span>Speed placeholder</span> */}
            </div>
        </div>
    </div>
  );
};