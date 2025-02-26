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
import { checkPassword } from "../../password_helpers";

export function addDBEventListeners() {
  ipcMain.handle(DB_LOGIN, async (event, data) => {
    let username:string = data.username;
    let password:string = data.password;

    try {
      const result:any = await fetchOne("SELECT * FROM users WHERE username = ?", [username]);

      if (result) {
        const hashedPassword = result.password;
        const isPasswordMatch = await checkPassword(password, hashedPassword);
        if (isPasswordMatch) {
          return result;
        } else {
          return false;
        }
      }
    } catch (error) {
      return false;
    }
  });
}
