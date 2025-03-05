import { ipcMain } from "electron";
import {
  DISK_GET
} from "./disk-channels";
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
}
