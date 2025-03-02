import {
  EXCEL_SAVE
} from "./excel-channels";

export function exposeExcelContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("excel", {
    saveToExcel: (metadata: any, data: any) => ipcRenderer.invoke(EXCEL_SAVE, { metadata, data }),
  });
}
