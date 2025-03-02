import { app, BrowserWindow, ipcMain, dialog } from "electron";
import {
    EXCEL_SAVE
} from "./excel-channels";
import path from "path";
import { saveToExcel } from "../../excel_helpers";

export function addExcelEventListeners(mainWindow: BrowserWindow) {
    ipcMain.handle(EXCEL_SAVE, async (event, { metadata, data, title }) => {
        if (!data || data.length === 0) {
            throw new Error('No data to save');
        }

        const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
            title: 'Save Excel File',
            defaultPath: path.join(app.getPath('documents'), new Date().toISOString().slice(0, 10) + '-' + title + '.xlsx'),
            filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
        });

        if (canceled) return null;

        if (!filePath) {
            throw new Error('No file path selected');
        }

        const metadataSheet = [metadata];

        const dataRows = data;

        return saveToExcel(filePath, [...metadataSheet, ...dataRows], 'Report');
    });
}




