import {
  DISK_GET,
  DISK_CHECK_SPACE
} from "./disk-channels";

export function exposeDiskContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("disk", {
    disk_get: () => ipcRenderer.invoke(DISK_GET),
    disk_check_space: () => ipcRenderer.invoke(DISK_CHECK_SPACE),
  });
}
