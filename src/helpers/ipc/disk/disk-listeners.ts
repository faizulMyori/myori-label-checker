import { ipcMain } from "electron";
import {
  DISK_GET
} from "./disk-channels";
import checkDiskSpace from "check-disk-space";

export function addDiskEventListeners() {
  ipcMain.handle(DISK_GET, () => {
    return new Promise((resolve, reject) => {
      checkDiskSpace('C:/').then((result: any) => {
        resolve(result);
      })
    });
  });
}
