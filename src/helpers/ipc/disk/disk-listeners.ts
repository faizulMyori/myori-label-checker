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

  ipcMain.handle(DISK_CHECK_SPACE, () => {
    checkDiskSpace('C:/').then((result: any) => {
      if (result.free / result.size < 0.8) {
        ipcMain.emit(WIN_DIALOG_INFO, { title: "Disk Full", message: "Disk C: is 80% full. Please free up space." });
      }
    }).catch((error: any) => {
    })
  });
}
