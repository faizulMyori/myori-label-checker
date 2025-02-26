import {
  DB_SET_DB_PATH,
  DB_EXECUTE_QUERY,
  DB_FETCH_ONE,
  DB_FETCH_MANY,
  DB_FETCH_ALL,
  DB_EXECUTE_MANY,
  DB_EXECUTE_SCRIPT,
  DB_LOAD_EXTENSION,
  DB_BACKUP,
  DB_LOGIN
} from "./db-channels";

export function exposeDBContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("sqlite", {
    db_login: (username: any, password: any) => ipcRenderer.invoke(DB_LOGIN, {username, password }),
    create_product: (data: any) => ipcRenderer.invoke('db:createProduct', data),
    get_products: () => ipcRenderer.invoke('db:getProducts'),
    search_products: (query: string) => ipcRenderer.invoke('db:searchProducts', query),
    update_product: (data: any) => ipcRenderer.invoke('db:updateProduct', data),
    delete_product: (id: number) => ipcRenderer.invoke('db:deleteProduct', id),
  });
}
