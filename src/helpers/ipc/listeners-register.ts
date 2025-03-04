import { BrowserWindow } from "electron";
import { addThemeEventListeners } from "./theme/theme-listeners";
import { addWindowEventListeners } from "./window/window-listeners";
import { addDBEventListeners } from "./db/db-listeners";
import { addTCPEventListeners } from "./tcp/tcp-listeners";
import { addExcelEventListeners } from "./excel/excel-listeners";
import { addSERIALEventListeners } from "./serial/serial-listeners";

export default function registerListeners(mainWindow: BrowserWindow) {
  addWindowEventListeners(mainWindow);
  addThemeEventListeners();
  addDBEventListeners();
  addTCPEventListeners();
  addExcelEventListeners(mainWindow);
  addSERIALEventListeners();
}
