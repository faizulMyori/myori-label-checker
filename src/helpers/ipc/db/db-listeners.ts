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
  DB_BACKUP
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
  ipcMain.handle(DB_SET_DB_PATH, async (event, dbPath, isUri) => {
    try {
      return await setdbPath(dbPath, isUri);
    } catch (error) {
      return error;
    }
  });

  ipcMain.handle(DB_EXECUTE_QUERY, async (event, query, value) => {
    try {
      return await executeQuery(query, value);
    } catch (error) {
      return error;
    }
  });

  ipcMain.handle(DB_FETCH_ONE, async (event, query, value) => {
    try {
      return await fetchOne(query, value);
    } catch (error) {
      return error;
    }
  });

  ipcMain.handle(DB_FETCH_MANY, async (event, query, size, value) => {
    try {
      return await fetchMany(query, size, value);
    } catch (error) {
      return error;
    }
  });

  ipcMain.handle(DB_FETCH_ALL, async (event, query, value) => {
    try {
      return await fetchAll(query, value);
    } catch (error) {
      return error;
    }
  });

  ipcMain.handle(DB_EXECUTE_MANY, async (event, query, values) => {
    try {
      return await executeMany(query, values);
    } catch (error) {
      return error;
    }
  });

  ipcMain.handle(DB_EXECUTE_SCRIPT, async (event, scriptpath) => {
    try {
      return await executeScript(scriptpath);
    } catch (error) {
      return error;
    }
  });

  ipcMain.handle(DB_LOAD_EXTENSION, async (event, path) => {
    try {
      return await load_extension(path);
    } catch (error) {
      return error;
    }
  });

  ipcMain.handle(DB_BACKUP, async (event, target, pages, name, sleep) => {
    try {
      return await backup(target, Number(pages), name, Number(sleep));
    } catch (error) {
      return error;
    }
  });
}
