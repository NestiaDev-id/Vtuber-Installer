export enum InstallStep {
  WELCOME = 'WELCOME',
  INSTALLING = 'INSTALLING',
  COMPLETE = 'COMPLETE',
  UNINSTALL_CONFIRM = 'UNINSTALL_CONFIRM',
  UNINSTALLING = 'UNINSTALLING',
  UNINSTALL_COMPLETE = 'UNINSTALL_COMPLETE'
}

export interface InstallConfig {
  installPath: string;
  createDesktopShortcut: boolean;
  createStartMenuShortcut: boolean;
}

export interface ReleaseNote {
  version: string;
  date: string;
  notes: string[];
}