import { app, BrowserWindow, ipcMain, dialog } from "electron";
import {
    EXCEL_SAVE
} from "./excel-channels";
import path from "path";
import { saveToExcel } from "../../excel_helpers";

export function addExcelEventListeners( mainWindow: BrowserWindow) {
    ipcMain.handle(EXCEL_SAVE, async (event, { metadata, data }) => {
        if (!data || data.length === 0) {
            throw new Error('No data to save');
        }
    
        const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
            title: 'Save Excel File',
            defaultPath: path.join(app.getPath('documents'), new Date().toISOString().slice(0, 10) + ' SIRIM Labels.xlsx'),
            filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
        });
    
        if (canceled) return null;
    
        if (!filePath) {
            throw new Error('No file path selected');
        }
    
        const metadataSheet = [
            ["SIRIM SERIAL NO.", "BATCH NO", "BRAND/TRADEMARK", "MODEL", "TYPE", "RATING", "SIZE"],
        ];
    
        const dataRows = data.map((row:any) => [
            row['Serial Number'],
            // batchData.batchNo,
            // batchData.brand,
            // batchData.model,
            // batchData.type,
            // batchData.rating,
            // batchData.size
        ]);
    
        return saveToExcel(filePath, [...metadataSheet, ...dataRows], 'Report');
    });
}




