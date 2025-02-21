import { app, BrowserWindow, ipcMain } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import path from "path";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import sqlite, {
  executeQuery,
  setdbPath,
} from "sqlite-electron";

const inDevelopment = process.env.NODE_ENV === "development";

function createWindow() {
  const preload = path.join(__dirname, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      preload: preload,
    },
  });
  registerListeners(mainWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
}

async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }
}

// Function to set database path upon app ready
async function initializeDatabase() {
  try {
    const dbPath = "./database.db"; // Replace with your actual database path
    const isUri = false; // Set to true if dbPath is a URI
    await setdbPath(dbPath, isUri);
    initializeBatchesTable();
    initializeUsersTable();
    initializeProductsTable();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database", error);
  }
}

async function initializeUsersTable() {
  const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
  await executeQuery(sql);
}

async function initializeBatchesTable() {
  const sql = `
      CREATE TABLE IF NOT EXISTS batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_no TEXT NOT NULL,
        product_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
  await executeQuery(sql);
}

async function initializeProductsTable() {
  const sql = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        type TEXT NOT NULL,
        rating TEXT NOT NULL,
        size TEXT NOT NULL,
        timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
  await executeQuery(sql);
}

app.whenReady()
  .then(createWindow)
  .then(installExtensions)
  .then(initializeDatabase);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});