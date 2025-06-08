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
import { autoUpdater } from "electron-updater";


const logFilePath = path.join(app.getPath('userData'), 'logs', 'app.log');
console.log('Log file path:', logFilePath); // visible in terminal

const inDevelopment = process.env.NODE_ENV === "development";

// Configure auto updater
autoUpdater.logger = console;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let updateProgressWindow: BrowserWindow | null = null;

function createUpdateProgressWindow() {
  updateProgressWindow = new BrowserWindow({
    width: 400,
    height: 200,
    frame: false,
    resizable: false,
    center: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
    parent: BrowserWindow.getFocusedWindow() || undefined,
    modal: true,
  });

  // Create a simple HTML content for the progress window
  const progressHtml = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            text-align: center;
            background-color: #f5f5f5;
            color: #333;
            user-select: none;
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          h3 {
            margin-bottom: 20px;
          }
          .progress-container {
            width: 100%;
            background-color: #ddd;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .progress-bar {
            height: 20px;
            background-color: #4CAF50;
            border-radius: 4px;
            width: 0%;
            transition: width 0.3s;
          }
          .percent {
            margin-top: 10px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <h3>Downloading Update</h3>
        <div class="progress-container">
          <div class="progress-bar" id="progress"></div>
        </div>
        <div class="percent" id="percent">0%</div>
        <script>
          window.electronAPI = {
            updateProgress: (percent) => {
              document.getElementById('progress').style.width = percent + '%';
              document.getElementById('percent').innerText = percent + '%';
            }
          };
        </script>
      </body>
    </html>
  `;

  // Load the HTML content
  updateProgressWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(progressHtml)}`);
  updateProgressWindow.setAlwaysOnTop(true);

  return updateProgressWindow;
}

function checkForUpdates() {
  if (inDevelopment) {
    console.log('Skipping update check in development mode');
    return;
  }

  autoUpdater.checkForUpdates().catch(err => {
    console.error('Error checking for updates:', err);
  });
}

// Auto updater events
autoUpdater.on('update-available', (info) => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (!mainWindow) return;

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: `A new version (${info.version}) is available. Do you want to download it now?`,
    buttons: ['Yes', 'No'],
    defaultId: 0
  }).then(({ response }) => {
    if (response === 0) {
      createUpdateProgressWindow();
      autoUpdater.downloadUpdate().catch(err => {
        console.error('Error downloading update:', err);
        if (updateProgressWindow) {
          updateProgressWindow.close();
          updateProgressWindow = null;
        }
      });
    }
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  if (updateProgressWindow) {
    const percent = Math.round(progressObj.percent);
    updateProgressWindow.webContents.executeJavaScript(`window.electronAPI.updateProgress(${percent})`);
  }
});

autoUpdater.on('update-downloaded', () => {
  if (updateProgressWindow) {
    updateProgressWindow.close();
    updateProgressWindow = null;
  }

  const mainWindow = BrowserWindow.getFocusedWindow();
  if (!mainWindow) return;

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: 'Update has been downloaded. The application will be restarted to install the update.',
    buttons: ['Restart Now', 'Later'],
    defaultId: 0
  }).then(({ response }) => {
    if (response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });
});

autoUpdater.on('error', (err) => {
  console.error('Update error:', err);
  if (updateProgressWindow) {
    updateProgressWindow.close();
    updateProgressWindow = null;
  }

  const mainWindow = BrowserWindow.getFocusedWindow();
  if (mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Update Error',
      message: 'An error occurred while updating the application.',
      detail: err.message
    });
  }
});

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

    return mainWindow;
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
  .then(() => {
    const mainWindow = createWindow();
    installExtensions();
    initializeDatabase();
    // Check for updates after the app is ready and window is created
    checkForUpdates();
  });

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