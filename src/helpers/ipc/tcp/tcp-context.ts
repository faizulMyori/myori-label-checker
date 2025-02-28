import {
  TCP_CONNECT,
  TCP_CLOSED,
  TCP_DISCONNECT,
  TCP_ERROR,
  TCP_RECEIVE
} from "./tcp-channels";

export function exposeTCPContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("tcpConnection", {
    tcp_connect: (connectionDetails: any) => ipcRenderer.invoke(TCP_CONNECT, connectionDetails),
    onTCPDataReceived: (callback:any) => ipcRenderer.on(TCP_RECEIVE, callback),
    onTCPDataError: (callback:any) => ipcRenderer.on(TCP_ERROR, callback),
    tcp_closed: (callback:any) => ipcRenderer.on(TCP_CLOSED, callback),
    tcp_disconnect: () => ipcRenderer.invoke(TCP_DISCONNECT),
  });
}
