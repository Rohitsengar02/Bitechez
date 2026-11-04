import { contextBridge, ipcRenderer } from 'electron';
import { IPCChannels } from '@bitechez/shared-types';

export const bitechezAPI = {
  invoke: async <K extends keyof IPCChannels>(
    channel: K,
    payload: IPCChannels[K]['request']
  ): Promise<IPCChannels[K]['response']> => {
    return ipcRenderer.invoke(channel, payload);
  },
  on: (channel: string, listener: (...args: any[]) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, ...args: any[]) => listener(...args);
    ipcRenderer.on(channel, subscription);
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
};

contextBridge.exposeInMainWorld('bitechezAPI', bitechezAPI);

declare global {
  interface Window {
    bitechezAPI: typeof bitechezAPI;
  }
}

