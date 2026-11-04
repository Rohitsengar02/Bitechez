import { z } from 'zod';

export const ServerEnvSchema = z.object({
  APP_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  APP_NAME: z.string().default('Bitechez POS'),
  APP_VERSION: z.string().default('1.0.0'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  TENANT_ID: z.string().uuid().default('00000000-0000-0000-0000-000000000001'),
  OUTLET_ID: z.string().uuid().default('11111111-1111-1111-1111-111111111111'),
  DEVICE_ID: z.string().uuid().default('22222222-2222-2222-2222-222222222222'),
  STATION_TYPE: z.enum(['cashier-terminal', 'kitchen-display', 'standalone']).default('cashier-terminal'),

  LOCAL_SERVER_HOST: z.string().default('127.0.0.1'),
  LOCAL_SERVER_PORT: z.coerce.number().default(3001),
  LOCAL_DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/bitechez_local'),
  SOCKET_URL: z.string().default('http://127.0.0.1:3001'),

  DESKTOP_SQLITE_PATH: z.string().default('./bitechez_terminal.sqlite'),

  CLOUD_API_URL: z.string().default('http://127.0.0.1:3002'),
  CLOUD_DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/bitechez_cloud'),
  CLOUD_SYNC_ENABLED: z.coerce.boolean().default(false),
  SYNC_INTERVAL: z.coerce.number().default(5000),

  PRINTER_DEFAULT: z.string().default('VIRTUAL_RECEIPT_PRINTER'),
  PRINTER_PAPER_WIDTH: z.enum(['58mm', '80mm']).default('80mm'),
});

export const ClientEnvSchema = z.object({
  VITE_APP_NAME: z.string().default('Bitechez POS'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_LOCAL_SERVER_URL: z.string().default('http://127.0.0.1:3001'),
  VITE_DEFAULT_CURRENCY: z.string().default('INR'),
  VITE_CURRENCY_SYMBOL: z.string().default('₹'),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type ClientEnv = z.infer<typeof ClientEnvSchema>;

declare const process: any;

export function validateServerEnv(rawEnv: Record<string, unknown> = typeof process !== 'undefined' ? process.env : {}): ServerEnv {
  const result = ServerEnvSchema.safeParse(rawEnv);
  if (!result.success) {
    console.error('❌ Invalid Server Environment Configuration:');
    console.error(result.error.format());
    throw new Error('Invalid Server Environment variables');
  }
  return result.data;
}

export function validateClientEnv(rawEnv: Record<string, unknown>): ClientEnv {
  const result = ClientEnvSchema.safeParse(rawEnv);
  if (!result.success) {
    console.error('❌ Invalid Client Environment Configuration:');
    console.error(result.error.format());
    throw new Error('Invalid Client Environment variables');
  }
  return result.data;
}
