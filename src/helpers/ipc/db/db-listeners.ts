import { BrowserWindow, ipcMain } from "electron";
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

import sqlite, {
  backup,
  executeMany,
  executeQuery,
  executeScript,
  fetchAll,
  fetchMany,
  fetchOne,
  load_extension,
  setdbPath,
} from "sqlite-electron";

export function addDBEventListeners() {
  ipcMain.handle(DB_LOGIN, async (event, data) => {
    console.log(data.username)
    let username:string = data.username;
    let password:string = data.password;

    try {
      return await fetchOne("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);
    } catch (error) {
      return error;
    }
  });
}
