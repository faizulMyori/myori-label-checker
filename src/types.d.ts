// Type declarations for development environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    MAIN_WINDOW_VITE_DEV_SERVER_URL?: string;
  }
}

interface Label {
  id: number;
  serial: string;
  qr_code: string;
  status: string;
  batch_id: number;
  timestamp: number;
}

interface Product {
  id: number;
  sku: string;
  brand: string;
  model: string;
  type: string;
  rating: string;
  size: string;
}

interface Batch {
  id: number;
  batch_no: string;
  shift_number: string;
  product_id: number;
  date: string;
}

// Preload types
interface ThemeModeContext {
  theme: string;
  setTheme: (theme: string) => void;
}

interface ElectronWindow {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  info: (title: any, message: any) => Promise<void>;
  selectDirectory: (title: string, message: string) => Promise<string | null>;
  checkFileExists: (filePath: string) => Promise<boolean>;
  openFileLocation: (filePath: string) => Promise<void>;
}

interface sqlite {
  get_connections: () => Promise<any>;
  save_connections: (data: any) => Promise<any>;
  get_products: () => Promise<any>;
  get_product: (id: number) => Promise<any>;
  save_product: (data: any) => Promise<any>;
  update_product: (id: number, data: any) => Promise<any>;
  delete_product: (id: number) => Promise<any>;
  get_batches: () => Promise<any>;
  get_batch: (id: number) => Promise<any>;
  save_batch: (data: any) => Promise<any>;
  update_batch: (id: number, data: any) => Promise<any>;
  delete_batch: (id: number) => Promise<any>;
  get_labels: () => Promise<any>;
  get_label: (id: number) => Promise<any>;
  save_label: (data: any) => Promise<any>;
  update_label: (id: number, data: any) => Promise<any>;
  delete_label: (id: number) => Promise<any>;
  get_label_by_serial: (serial: string) => Promise<any>;
  get_label_by_qr: (qr: string) => Promise<any>;
  get_label_by_batch: (batch_id: number) => Promise<any>;
  get_label_by_batch_and_status: (batch_id: number, status: string) => Promise<any>;
  get_label_by_status: (status: string) => Promise<any>;
  get_label_count_by_batch: (batch_id: number) => Promise<any>;
  get_label_count_by_batch_and_status: (batch_id: number, status: string) => Promise<any>;
  get_label_count_by_status: (status: string) => Promise<any>;
  get_label_count: () => Promise<any>;
  get_batch_count: () => Promise<any>;
  get_product_count: () => Promise<any>;
  get_batch_by_product: (product_id: number) => Promise<any>;
  get_batch_count_by_product: (product_id: number) => Promise<any>;
  get_label_by_product: (product_id: number) => Promise<any>;
  get_label_count_by_product: (product_id: number) => Promise<any>;
  get_label_by_product_and_status: (product_id: number, status: string) => Promise<any>;
  get_label_count_by_product_and_status: (product_id: number, status: string) => Promise<any>;
  get_label_by_batch_and_product: (batch_id: number, product_id: number) => Promise<any>;
  get_label_count_by_batch_and_product: (batch_id: number, product_id: number) => Promise<any>;
  get_label_by_batch_and_product_and_status: (batch_id: number, product_id: number, status: string) => Promise<any>;
  get_label_count_by_batch_and_product_and_status: (batch_id: number, product_id: number, status: string) => Promise<any>;
  get_label_by_date: (date: string) => Promise<any>;
  get_label_count_by_date: (date: string) => Promise<any>;
  get_label_by_date_and_status: (date: string, status: string) => Promise<any>;
  get_label_count_by_date_and_status: (date: string, status: string) => Promise<any>;
  get_label_by_date_and_product: (date: string, product_id: number) => Promise<any>;
  get_label_count_by_date_and_product: (date: string, product_id: number) => Promise<any>;
  get_label_by_date_and_product_and_status: (date: string, product_id: number, status: string) => Promise<any>;
  get_label_count_by_date_and_product_and_status: (date: string, product_id: number, status: string) => Promise<any>;
  get_label_by_date_and_batch: (date: string, batch_id: number) => Promise<any>;
  get_label_count_by_date_and_batch: (date: string, batch_id: number) => Promise<any>;
  get_label_by_date_and_batch_and_status: (date: string, batch_id: number, status: string) => Promise<any>;
  get_label_count_by_date_and_batch_and_status: (date: string, batch_id: number, status: string) => Promise<any>;
  get_label_by_date_and_batch_and_product: (date: string, batch_id: number, product_id: number) => Promise<any>;
  get_label_count_by_date_and_batch_and_product: (date: string, batch_id: number, product_id: number) => Promise<any>;
  get_label_by_date_and_batch_and_product_and_status: (date: string, batch_id: number, product_id: number, status: string) => Promise<any>;
  get_label_count_by_date_and_batch_and_product_and_status: (date: string, batch_id: number, product_id: number, status: string) => Promise<any>;
}

interface tcpConnection {
  tcp_connect: (connectionDetails: any) => Promise<any>;
  tcp_received: (callback: any) => void;
  tcp_closed: (callback: any) => void;
  tcp_disconnect: () => Promise<any>;
  tcp_connected: (callback: any) => void;
  tcp_send: (data: any) => Promise<any>;
}

interface excel {
  excel_export: (data: any) => Promise<any>;
}

interface serial {
  serial_com_open: (connectionDetails: any) => Promise<any>;
  serial_received: (callback: any) => void;
  serial_com_close: (callback: any) => void;
  serial_com_disconnect: () => Promise<any>;
  serial_com_send: (data: any) => Promise<any>;
  serial_com_get: () => Promise<any>;
}

interface disk {
  disk_get: (path: any) => Promise<any>;
  disk_check_space: (path: any) => Promise<any>;
}

interface license {
  getMachineId: () => Promise<string>;
  validateLicenseKey: (licenseKey: string) => Promise<{ valid: boolean; error?: string; expiryDate?: string; }>;
  saveLicenseValidation: (licenseKey: string, isValid: boolean, expiryDate?: string) => Promise<void>;
  checkMachineLicense: () => Promise<{ valid: boolean; error?: string; expiryDate?: string; }>;
}

interface Window {
  themeMode: ThemeModeContext;
  electronWindow: ElectronWindow;
  sqlite: sqlite;
  tcpConnection: tcpConnection;
  excel: excel;
  serial: serial;
  disk: disk;
  license: license;
  electron: {
    ipcRenderer: {
      on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
      send: (channel: string, ...args: any[]) => void;
    };
  };
}
