import {
  EXCEL_SAVE
} from "./excel-channels";

export function exposeExcelContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("excel", {
    save_to_excel: (metadata: any, data: any, title: string) => ipcRenderer.invoke(EXCEL_SAVE, { metadata, data, title }),
  });
}
