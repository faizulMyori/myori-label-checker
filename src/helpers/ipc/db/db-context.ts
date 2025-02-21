import {
  DB_SET_DB_PATH,
  DB_EXECUTE_QUERY,
  DB_FETCH_ONE,
  DB_FETCH_MANY,
  DB_FETCH_ALL,
  DB_EXECUTE_MANY,
  DB_EXECUTE_SCRIPT,
  DB_LOAD_EXTENSION,
  DB_BACKUP
} from "./db-channels";

export function exposeDBContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("electronWindow", {
    db_execute_query: (event: any, query: any, value: any) => ipcRenderer.invoke(DB_EXECUTE_QUERY, { event, query, value }),
    db_fetch_one: (event: any, query: any, value: any) => ipcRenderer.invoke(DB_FETCH_ONE, { event, query, value }),
    db_fetch_many: (event: any, query: any, size: any, value: any) => ipcRenderer.invoke(DB_FETCH_MANY, { event, query, size, value }),
    db_fetch_all: (event: any, query: any, value: any) => ipcRenderer.invoke(DB_FETCH_ALL, { event, query, value }),
    db_execute_many: (event: any, query: any, values: any) => ipcRenderer.invoke(DB_EXECUTE_MANY, { event, query, values }),
    db_execute_script: (path: any) => ipcRenderer.invoke(DB_EXECUTE_SCRIPT, { path }),
    db_load_extension: (path: any) => ipcRenderer.invoke(DB_LOAD_EXTENSION, { path }),
    db_backup: (event: any, target: any, pages: any, name: any, sleep: any) => ipcRenderer.invoke(DB_BACKUP, { event, target, pages, name, sleep }),
  });
}
