import { ipcMain } from "electron";
import {
  DISK_CHECK_SPACE,
  DISK_GET
} from "./disk-channels";
import { WIN_DIALOG_INFO } from "../window/window-channels";
const checkDiskSpace = require('check-disk-space').default

export function addDiskEventListeners() {
  ipcMain.handle(DISK_GET, () => {
    return new Promise((resolve, reject) => {
      checkDiskSpace('C:/').then((result: any) => {
        resolve(result);
      }).catch((error: any) => {
        reject(error);
      })
    });
  });

  ipcMain.handle(DISK_CHECK_SPACE, async () => {
    try {
      const result = await checkDiskSpace("C:/");

      if ((result.size - result.free) / result.size >= 0.8) {
        ipcMain.emit(WIN_DIALOG_INFO, {
          title: "Disk Full",
          message: "Disk C: is 80% full. Please free up space.",
        });
      }

      return result; // Ensure the function returns the disk space info
    } catch (error) {
      console.error("Error checking disk space:", error);
      throw error; // Propagate the error to be handled in the renderer process
    }
  });
}
