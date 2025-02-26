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

  ipcMain.handle('db:createProduct', async (event, data) => {
    try {
      return await executeQuery("INSERT INTO products (brand, model, type, rating, size) VALUES (?, ?, ?, ?, ?)", [data.brand, data.model, data.type, data.rating, data.size]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle('db:getProducts', async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM products");
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle('db:searchProducts', async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM products WHERE brand LIKE ? OR model LIKE ? OR type LIKE ? OR rating LIKE ? OR size LIKE ?", [`%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle('db:updateProduct', async (event, data) => {
    try {
      return await executeQuery("UPDATE products SET brand = ?, model = ?, type = ?, rating = ?, size = ? WHERE id = ?", [data.brand, data.model, data.type, data.rating, data.size, data.id]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle('db:deleteProduct', async (event, data) => {
    try {
      return await executeQuery("DELETE FROM products WHERE id = ?", [data]);
    } catch (error) {
      return false;
    }
  });
}
