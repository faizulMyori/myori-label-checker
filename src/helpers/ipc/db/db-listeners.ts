import { BrowserWindow, ipcMain } from "electron";
import {
  DB_LOGIN,
  DB_DELETE_PRODUCT,
  DB_UPDATE_PRODUCT,
  DB_CREATE_PRODUCT,
  DB_GET_PRODUCTS,
  DB_SEARCH_PRODUCTS,
} from "./db-channels";

import {
  executeQuery,
  fetchAll,
  fetchOne,
} from "sqlite-electron";
import { checkPassword } from "../../password_helpers";

export function addDBEventListeners() {
  ipcMain.handle(DB_LOGIN, async (event, data) => {
    let username: string = data.username;
    let password: string = data.password;

    try {
      const result: any = await fetchOne("SELECT * FROM users WHERE username = ?", [username]);

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

  ipcMain.handle(DB_CREATE_PRODUCT, async (event, data) => {
    try {
      return await executeQuery("INSERT INTO products (brand, model, type, rating, size) VALUES (?, ?, ?, ?, ?)", [data.brand, data.model, data.type, data.rating, data.size]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_GET_PRODUCTS, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM products");
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_SEARCH_PRODUCTS, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM products WHERE brand LIKE ? OR model LIKE ? OR type LIKE ? OR rating LIKE ? OR size LIKE ?", [`%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_PRODUCT, async (event, data) => {
    try {
      return await executeQuery("UPDATE products SET brand = ?, model = ?, type = ?, rating = ?, size = ? WHERE id = ?", [data.brand, data.model, data.type, data.rating, data.size, data.id]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_DELETE_PRODUCT, async (event, data) => {
    try {
      return await executeQuery("DELETE FROM products WHERE id = ?", [data]);
    } catch (error) {
      return false;
    }
  });
}
