import { UUID } from './models';

export type PrinterType = 'escpos_usb' | 'escpos_lan' | 'windows_driver' | 'virtual';
export type PrinterPaperWidth = '58mm' | '80mm';
export type PrinterStation = 'billing' | 'kitchen' | 'bar' | 'takeaway';
export type PrintJobStatus = 'queued' | 'printing' | 'completed' | 'failed' | 'cancelled';

export interface PrinterDevice {
  id: UUID;
  outletId: UUID;
  name: string;
  station: PrinterStation;
  type: PrinterType;
  paperWidth: PrinterPaperWidth;
  ipAddress?: string;
  port?: number;
  usbVendorId?: string;
  usbProductId?: string;
  windowsPrinterName?: string;
  isDefault: boolean;
  isActive: boolean;
  autoCut: boolean;
  openCashDrawer: boolean;
}

export interface PrintJob {
  id: UUID;
  outletId: UUID;
  printerId: UUID;
  template: 'receipt' | 'kot' | 'bill_estimate' | 'test';
  title: string;
  rawPayload: Record<string, unknown>;
  escposBuffer?: string; // base64 encoded binary
  status: PrintJobStatus;
  retryCount: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}
