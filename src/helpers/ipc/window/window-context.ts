import {
  WINDOW_MINIMIZE,
  WINDOW_MAXIMIZE,
  WINDOW_CLOSE,
  WINDOW_INFO,
  WINDOW_SELECT_DIRECTORY,
  WINDOW_CHECK_FILE_EXISTS,
  WINDOW_OPEN_FILE_LOCATION
} from "./window-channels";

export function exposeWindowContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("electronWindow", {
    minimize: () => ipcRenderer.invoke(WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.invoke(WINDOW_MAXIMIZE),
    close: () => ipcRenderer.invoke(WINDOW_CLOSE),
    info: (title: string, message: string) => ipcRenderer.invoke(WINDOW_INFO, { title, message }),
    selectDirectory: (title: string, message: string) => ipcRenderer.invoke(WINDOW_SELECT_DIRECTORY, { title, message }),
    checkFileExists: (filePath: string) => ipcRenderer.invoke(WINDOW_CHECK_FILE_EXISTS, filePath),
    openFileLocation: (filePath: string) => ipcRenderer.invoke(WINDOW_OPEN_FILE_LOCATION, filePath),
  });
}
