import {
  DB_LOGIN,
  DB_DELETE_PRODUCT,
  DB_UPDATE_PRODUCT,
  DB_CREATE_PRODUCT,
  DB_GET_PRODUCTS,
  DB_SEARCH_PRODUCTS,
  DB_CREATE_CONNECTION,
  DB_GET_CONNECTIONS,
  DB_CREATE_LICENSE,
  DB_SEARCH_LICENSES,
  DB_DELETE_LICENSE,
  DB_GET_LICENSES,
  DB_UPDATE_LICENSE,
  DB_CREATE_USER,
  DB_DELETE_USER,
  DB_GET_USERS,
  DB_SEARCH_USERS,
  DB_UPDATE_USER
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

    create_license: (data: any) => ipcRenderer.invoke(DB_CREATE_LICENSE, data),
    get_licenses: () => ipcRenderer.invoke(DB_GET_LICENSES),
    search_licenses: (query: string) => ipcRenderer.invoke(DB_SEARCH_LICENSES, query),
    update_license: (data: any) => ipcRenderer.invoke(DB_UPDATE_LICENSE, data),
    delete_license: (id: number) => ipcRenderer.invoke(DB_DELETE_LICENSE, id),

    create_user: (data: any) => ipcRenderer.invoke(DB_CREATE_USER, data),
    get_users: () => ipcRenderer.invoke(DB_GET_USERS),
    search_users: (query: string) => ipcRenderer.invoke(DB_SEARCH_USERS, query),
    update_user: (data: any) => ipcRenderer.invoke(DB_UPDATE_USER, data),
    delete_user: (id: number) => ipcRenderer.invoke(DB_DELETE_USER, id),

    create_connection: (ip: any, port: any) => ipcRenderer.invoke(DB_CREATE_CONNECTION, { ip, port }),
    get_connections: () => ipcRenderer.invoke(DB_GET_CONNECTIONS),
  });
}
