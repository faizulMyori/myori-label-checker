import {
  DB_LOGIN,
  DB_DELETE_PRODUCT,
  DB_UPDATE_PRODUCT,
  DB_CREATE_PRODUCT,
  DB_GET_PRODUCTS,
  DB_SEARCH_PRODUCTS,
} from "./db-channels";

export function exposeDBContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("sqlite", {
    db_login: (username: any, password: any) => ipcRenderer.invoke(DB_LOGIN, { username, password }),
    create_product: (data: any) => ipcRenderer.invoke(DB_CREATE_PRODUCT, data),
    get_products: () => ipcRenderer.invoke(DB_GET_PRODUCTS),
    search_products: (query: string) => ipcRenderer.invoke(DB_SEARCH_PRODUCTS, query),
    update_product: (data: any) => ipcRenderer.invoke(DB_UPDATE_PRODUCT, data),
    delete_product: (id: number) => ipcRenderer.invoke(DB_DELETE_PRODUCT, id),
  });
}
