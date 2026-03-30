import React, { useState, useEffect } from 'react';
import { InstallerFrame } from './components/InstallerFrame';
import { StepWelcome } from './components/StepWelcome';
import { StepInstalling } from './components/StepInstalling';
import { StepComplete } from './components/StepComplete';
import { StepUninstallConfirm } from './components/StepUninstallConfirm';
import { StepUninstallProgress } from './components/StepUninstallProgress';
import { StepUninstallComplete } from './components/StepUninstallComplete';
import { InstallConfig, InstallStep } from './types';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<InstallStep>(InstallStep.WELCOME);
  const [config, setConfig] = useState<InstallConfig>({
    installPath: 'C:\\VTuber-App',
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  });
  const [deleteAllData, setDeleteAllData] = useState(false);

  useEffect(() => {
    const checkMode = async () => {
      const isUninstall = await invoke<boolean>('check_uninstall_mode');
      if (isUninstall) {
        setCurrentStep(InstallStep.UNINSTALL_CONFIRM);
      }
    };
    checkMode();
  }, []);

  const nextStep = () => {
    switch (currentStep) {
      case InstallStep.WELCOME:
        setCurrentStep(InstallStep.INSTALLING);
        break;
      case InstallStep.INSTALLING:
        setCurrentStep(InstallStep.COMPLETE);
        break;
      case InstallStep.UNINSTALL_CONFIRM:
        setCurrentStep(InstallStep.UNINSTALLING);
        break;
      case InstallStep.UNINSTALLING:
        setCurrentStep(InstallStep.UNINSTALL_COMPLETE);
        break;
    }
  };

  const handleUninstallConfirm = (deleteAll: boolean) => {
    setDeleteAllData(deleteAll);
    setCurrentStep(InstallStep.UNINSTALLING);
  };

  const renderStep = () => {
    switch (currentStep) {
      case InstallStep.WELCOME:
        return (
          <StepWelcome 
            onNext={nextStep} 
            config={config} 
            setConfig={setConfig} 
          />
        );
      case InstallStep.INSTALLING:
        return <StepInstalling onComplete={nextStep} config={config} />;
      case InstallStep.COMPLETE:
        return <StepComplete onClose={() => {}} config={config} />;
      
      // Uninstaller Steps
      case InstallStep.UNINSTALL_CONFIRM:
        return (
          <StepUninstallConfirm 
            installPath={config.installPath}
            onCancel={() => getCurrentWindow().close()}
            onConfirm={handleUninstallConfirm}
          />
        );
      case InstallStep.UNINSTALLING:
        return (
          <StepUninstallProgress 
            installPath={config.installPath}
            deleteAll={deleteAllData}
            onComplete={nextStep}
            simulate={import.meta.env.DEV}
          />
        );
      case InstallStep.UNINSTALL_COMPLETE:
        return <StepUninstallComplete />;

      default:
        return null;
    }
  };

  return (
    <InstallerFrame>
      {renderStep()}
    </InstallerFrame>
  );
};

export default App;