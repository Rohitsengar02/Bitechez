export interface DeviceDetails {
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  brandModel: string;
  osName: string;
  osVersion: string;
  browserName: string;
  browserVersion: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  colorDepth: number;
  touchSupport: boolean;
  maxTouchPoints: number;
  language: string;
  timezone: string;
  connectionType?: string;
  batteryLevel?: number;
  isCharging?: boolean;
  userAgent: string;
  scannedAt: string;
}

export function detectDeviceDetails(): DeviceDetails {
  const ua = navigator.userAgent || '';
  const screenW = window.screen.width;
  const screenH = window.screen.height;
  const dpr = window.devicePixelRatio || 1;
  const touchPoints = navigator.maxTouchPoints || 0;
  const hasTouch = 'ontouchstart' in window || touchPoints > 0;

  // Determine Device Type
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
  if (/iPad|Tablet|(Android(?!.*Mobile))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = 'Mobile';
  } else if (hasTouch && Math.max(screenW, screenH) < 1024) {
    deviceType = 'Tablet';
  }

  // Detect OS
  let osName = 'Unknown OS';
  let osVersion = '';
  if (/iPhone|iPad|iPod/i.test(ua)) {
    osName = 'iOS';
    const match = ua.match(/OS (\d+[._]\d+([._]\d+)?)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/Android/i.test(ua)) {
    osName = 'Android';
    const match = ua.match(/Android (\d+(\.\d+)?)/);
    if (match) osVersion = match[1];
  } else if (/Windows NT/i.test(ua)) {
    osName = 'Windows';
    if (/Windows NT 10.0/i.test(ua)) osVersion = '10 / 11';
    else if (/Windows NT 6.3/i.test(ua)) osVersion = '8.1';
    else if (/Windows NT 6.1/i.test(ua)) osVersion = '7';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    osName = 'macOS';
    const match = ua.match(/Mac OS X (\d+[._]\d+([._]\d+)?)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/Linux/i.test(ua)) {
    osName = 'Linux';
  }

  // Detect Brand / Model
  let brandModel = 'Generic Device';
  if (/iPhone/i.test(ua)) {
    const minDim = Math.min(screenW, screenH);
    const maxDim = Math.max(screenW, screenH);
    if (minDim === 430 && maxDim === 932) brandModel = 'Apple iPhone 14/15/16 Pro Max';
    else if (minDim === 393 && maxDim === 852) brandModel = 'Apple iPhone 14/15/16 Pro';
    else if (minDim === 390 && maxDim === 844) brandModel = 'Apple iPhone 12/13/14';
    else if (minDim === 414 && maxDim === 896) brandModel = 'Apple iPhone 11 / XR / XS Max';
    else if (minDim === 375 && maxDim === 812) brandModel = 'Apple iPhone X / XS / 11 Pro';
    else if (minDim === 375 && maxDim === 667) brandModel = 'Apple iPhone SE / 8';
    else brandModel = 'Apple iPhone';
  } else if (/iPad/i.test(ua)) {
    brandModel = 'Apple iPad';
  } else if (/Android/i.test(ua)) {
    const modelMatch = ua.match(/;\s*([^;)]+)\s*Build/i) || ua.match(/\(([^;)]+);\s*([^;)]+)\)/);
    if (modelMatch && modelMatch[1]) {
      const candidate = modelMatch[1].trim();
      if (!/Android|Linux|U;|wv/i.test(candidate)) {
        brandModel = candidate;
      } else if (modelMatch[2]) {
        brandModel = modelMatch[2].trim();
      }
    }
    if (brandModel === 'Generic Device' || brandModel.length < 3) {
      if (/Samsung/i.test(ua) || /SM-[A-Z0-9]+/i.test(ua)) brandModel = 'Samsung Galaxy Device';
      else if (/Pixel/i.test(ua)) brandModel = 'Google Pixel';
      else if (/Xiaomi|Redmi|POCO/i.test(ua)) brandModel = 'Xiaomi Device';
      else if (/OnePlus/i.test(ua)) brandModel = 'OnePlus Device';
      else brandModel = 'Android Smartphone';
    }
  } else if (/Macintosh/i.test(ua)) {
    brandModel = 'Apple Mac';
  } else if (/Windows/i.test(ua)) {
    brandModel = 'Windows PC';
  }

  // Detect Browser
  let browserName = 'Browser';
  let browserVersion = '';
  if (/Edg\/(\d+(\.\d+)?)/i.test(ua)) {
    browserName = 'Microsoft Edge';
    browserVersion = ua.match(/Edg\/(\d+(\.\d+)?)/i)?.[1] || '';
  } else if (/Chrome\/(\d+(\.\d+)?)/i.test(ua) && !/Chromium|Edg|OPR/i.test(ua)) {
    browserName = 'Google Chrome';
    browserVersion = ua.match(/Chrome\/(\d+(\.\d+)?)/i)?.[1] || '';
  } else if (/Safari\/(\d+(\.\d+)?)/i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua)) {
    browserName = 'Apple Safari';
    const vMatch = ua.match(/Version\/(\d+(\.\d+)?)/i);
    browserVersion = vMatch ? vMatch[1] : '';
  } else if (/Firefox\/(\d+(\.\d+)?)/i.test(ua)) {
    browserName = 'Mozilla Firefox';
    browserVersion = ua.match(/Firefox\/(\d+(\.\d+)?)/i)?.[1] || '';
  } else if (/SamsungBrowser\/(\d+(\.\d+)?)/i.test(ua)) {
    browserName = 'Samsung Internet';
    browserVersion = ua.match(/SamsungBrowser\/(\d+(\.\d+)?)/i)?.[1] || '';
  }

  // Connection Info
  let connectionType: string | undefined;
  const nav = navigator as unknown as { connection?: { effectiveType?: string; type?: string } };
  if (nav.connection) {
    connectionType = nav.connection.effectiveType?.toUpperCase() || nav.connection.type || 'High-Speed';
  }

  return {
    deviceType,
    brandModel,
    osName,
    osVersion,
    browserName,
    browserVersion,
    screenWidth: screenW,
    screenHeight: screenH,
    pixelRatio: Number(dpr.toFixed(2)),
    colorDepth: window.screen.colorDepth || 24,
    touchSupport: hasTouch,
    maxTouchPoints: touchPoints,
    language: navigator.language || 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    connectionType,
    userAgent: ua,
    scannedAt: new Date().toLocaleString(),
  };
}

export interface TableScanRecord {
  id: string;
  tableId: string;
  tableName: string;
  scannerMobile: string;
  device: DeviceDetails;
  timestamp: number;
}

const STORAGE_KEY_SCANS = 'bitechez_table_scans';
const STORAGE_KEY_MY_MOBILE = 'bitechez_scanner_mobile';

export function getSavedScannerMobile(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_MY_MOBILE) || '';
  } catch {
    return '';
  }
}

export function saveScannerMobile(mobile: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_MY_MOBILE, mobile);
  } catch {
    /* ignore */
  }
}

export const SCAN_EVENT_KEY = 'bitechez_latest_scan_event';

export function broadcastScanEvent(record: TableScanRecord): void {
  try {
    localStorage.setItem(SCAN_EVENT_KEY, JSON.stringify({ record, time: Date.now() }));
  } catch {
    /* ignore */
  }

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('bitechez_scan_channel');
      bc.postMessage({ type: 'TABLE_SCANNED', record });
      bc.close();
    }
  } catch {
    /* ignore */
  }
}

export function saveTableScanRecord(record: TableScanRecord): void {
  try {
    const existing = getAllTableScanRecords();
    const updated = [record, ...existing.filter((r) => r.id !== record.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_SCANS, JSON.stringify(updated));
    broadcastScanEvent(record);
  } catch {
    /* ignore */
  }
}

export function getAllTableScanRecords(): TableScanRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCANS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getScansForTable(tableIdOrName: string): TableScanRecord[] {
  const all = getAllTableScanRecords();
  return all.filter((r) => r.tableId === tableIdOrName || r.tableName === tableIdOrName);
}

