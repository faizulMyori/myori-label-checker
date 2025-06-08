import { app, BrowserWindow, dialog } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import path from "path";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import {
  initializeDatabase,
} from "./helpers/db_helpers";
import { closeSerialPort } from "./helpers/serial_helpers";


const logFilePath = path.join(app.getPath('userData'), 'logs', 'app.log');
console.log('Log file path:', logFilePath); // visible in terminal

const inDevelopment = process.env.NODE_ENV === "development";

function createWindow() {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
    return;
  } else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });

    const preload = path.join(__dirname, "preload.js");
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      maximizable: true,
      //fullscreen: true,
      autoHideMenuBar: true,
      webPreferences: {
        devTools: true,
        contextIsolation: true,
        nodeIntegration: true,
        nodeIntegrationInSubFrames: false,
        preload: preload,
      },
      titleBarStyle: "hidden",
    });
    registerListeners(mainWindow);

    mainWindow.on("close", async (event) => {
      event.preventDefault();

      const response = await dialog.showMessageBox(mainWindow, {
        type: "question",
        buttons: ["Cancel", "Exit"],
        defaultId: 1,
        cancelId: 0,
        title: "Confirm Exit",
        message: "Sure to exit?"
      })

      if (response.response === 1) {
        try {
          const result = await closeSerialPort();
          console.log(result)
        } catch (err) {
          console.log(err)
        } finally {
          mainWindow.removeAllListeners("close")
          mainWindow.close()
          app.quit()
        }
        
      }
    })

    // In development mode, use Vite dev server
    if (process.env.NODE_ENV === 'development') {
      if (process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL);
      }
    } else {
      // In production mode, load from built files
      console.log('Loading in production mode');
      console.log('__dirname:', __dirname);
      console.log('app.getAppPath():', app.getAppPath());
      
      // Use a simple path relative to the main.js location
      // Since main.js is in .vite/build/ and renderer is in .vite/renderer/
      const rendererPath = path.join(__dirname, '../renderer/main_window/index.html');
      console.log('Loading renderer from:', rendererPath);
      
      mainWindow.loadFile(rendererPath);
    }
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