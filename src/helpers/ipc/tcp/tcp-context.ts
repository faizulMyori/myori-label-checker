import {
  TCP_CONNECT,
  TCP_CLOSED,
  TCP_DISCONNECT,
  TCP_ERROR,
  TCP_RECEIVE
} from "./tcp-channels";

export function exposeTCPContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("electronWindow", {
    connectTCP: (connectionDetails: any) => ipcRenderer.invoke(TCP_CONNECT, connectionDetails),
    onTCPDataReceived: (callback:any) => ipcRenderer.on(TCP_RECEIVE, callback),
    onTCPDataError: (callback:any) => ipcRenderer.on(TCP_ERROR, callback),
    onTCPConnectionClosed: (callback:any) => ipcRenderer.on(TCP_CLOSED, callback),
    disconnectTCP: () => ipcRenderer.invoke(TCP_DISCONNECT),
  });
}
