export const APP_METADATA = {
  name: 'Bitechez POS',
  tagline: 'Premium Offline-First Restaurant Operating System',
  version: '1.0.0',
  company: 'CyberLim Solutions',
  currency: {
    code: 'INR',
    symbol: '₹',
    minorUnit: 'paise',
    factor: 100, // 1 Rupee = 100 paise
  },
  timezone: 'Asia/Kolkata',
  defaultLanguage: 'en',
} as const;

export const DEFAULT_PORTS = {
  localServer: 3001,
  cloudApi: 3002,
  viteDev: 5173,
  postgres: 5432,
} as const;

export const OPERATING_MODES = {
  ONLINE: 'online',
  LOCAL_NETWORK: 'local-network',
  STANDALONE_OFFLINE: 'standalone-offline',
} as const;

export type OperatingMode = typeof OPERATING_MODES[keyof typeof OPERATING_MODES];

export const GST_SLABS = [
  { label: '0% Nil Rated', rate: 0 },
  { label: '5% Food Services', rate: 5 },
  { label: '12% Processed / Beverages', rate: 12 },
  { label: '18% AC Restaurant / Standard', rate: 18 },
  { label: '28% Luxury / Aerated', rate: 28 },
] as const;

