import { BrowserWindow, ipcMain } from "electron";
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
  DB_DELETE_LICENSE,
  DB_GET_LICENSES,
  DB_SEARCH_LICENSES,
  DB_UPDATE_LICENSE,
  DB_CREATE_USER,
  DB_DELETE_USER,
  DB_GET_USERS,
  DB_SEARCH_USERS,
  DB_UPDATE_USER,
} from "./db-channels";

import {
  executeQuery,
  fetchAll,
  fetchOne,
} from "sqlite-electron";
import { checkPassword, hashPassword } from "../../password_helpers";

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
      return await executeQuery("INSERT INTO products (sku, brand, model, type, rating, size, license_id) VALUES (?, ?, ?, ?, ?, ?, ?)", [data.sku, data.brand, data.model, data.type, data.rating, data.size, data.license_id]);
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
      return await fetchAll("SELECT * FROM products WHERE sku LIKE ? OR brand LIKE ? OR model LIKE ? OR type LIKE ? OR rating LIKE ? OR size LIKE ? or license_id LIKE ?", [`%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_PRODUCT, async (event, data) => {
    try {
      return await executeQuery("UPDATE products SET sku = ?, brand = ?, model = ?, type = ?, rating = ?, size = ?, license_id = ? WHERE id = ?", [data.sku, data.brand, data.model, data.type, data.rating, data.size, data.license_id, data.id]);
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

  // licenses
  ipcMain.handle(DB_CREATE_LICENSE, async (event, data) => {
    try {
      return await executeQuery("INSERT INTO licenses (name, code) VALUES (?, ?)", [data.name, data.code]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_GET_LICENSES, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM licenses");
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_SEARCH_LICENSES, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM licenses WHERE name LIKE ? OR code LIKE ? ", [`%${data}%`, `%${data}%`]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_LICENSE, async (event, data) => {
    try {
      return await executeQuery("UPDATE licenses SET name = ?, code = ? WHERE id = ?", [data.name, data.code, data.id]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_DELETE_LICENSE, async (event, data) => {
    try {
      return await executeQuery("DELETE FROM licenses WHERE id = ?", [data]);
    } catch (error) {
      return false;
    }
  });

  // users
  ipcMain.handle(DB_CREATE_USER, async (event, data) => {
    try {
      return await executeQuery("INSERT INTO users (username, password) VALUES (?, ?)", [data.username, hashPassword(data.password)]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_GET_USERS, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM users");
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_SEARCH_USERS, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM users WHERE username LIKE ? ", [`%${data}%`]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_USER, async (event, data) => {
    try {
      return await executeQuery("UPDATE users SET username = ? WHERE id = ?", [data.username, data.id]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_DELETE_USER, async (event, data) => {
    try {
      return await executeQuery("DELETE FROM users WHERE id = ?", [data]);
    } catch (error) {
      return false;
    }
  });


  ipcMain.handle(DB_CREATE_CONNECTION, async (event, data) => {
    // console.log(data)
    try {
      let checkIfAnyConnectionExisted = await fetchAll("SELECT * FROM connections");

      if (checkIfAnyConnectionExisted.length > 0) {
        //delete existing connection
        await executeQuery("DELETE * FROM connections");
      }

      return await executeQuery("INSERT INTO connections (ip, port, com) VALUES (?, ?, ?)", [data.ip, data.port, data.com]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_GET_CONNECTIONS, async (event) => {
    try {
      let data: any = await fetchOne("SELECT * FROM connections ORDER BY id DESC LIMIT 1");
      return data
    } catch (error) {
      return error;
    }
  });
}
