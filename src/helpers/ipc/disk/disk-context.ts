import {
  DISK_GET
} from "./disk-channels";

export function exposeDiskContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("disk", {
    disk_get: () => ipcRenderer.invoke(DISK_GET),
  });
}
