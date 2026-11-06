import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';

const isWeb = process.env.VITE_TARGET === 'web' || process.env.VERCEL === '1';

export default defineConfig({
  plugins: [
    react(),
    ...(!isWeb
      ? [
          electron([
            {
              entry: 'electron/main/index.ts',
              onstart(options) {
                options.startup();
              },
              vite: {
                build: {
                  outDir: 'dist-electron/main',
                  lib: {
                    entry: 'electron/main/index.ts',
                    formats: ['cjs'],
                  },
                  rollupOptions: {
                    external: ['better-sqlite3'],
                    output: {
                      format: 'cjs',
                      entryFileNames: '[name].cjs',
                    },
                  },
                },
              },
            },
            {
              entry: 'electron/preload/index.ts',
              onstart(options) {
                options.reload();
              },
              vite: {
                build: {
                  outDir: 'dist-electron/preload',
                  lib: {
                    entry: 'electron/preload/index.ts',
                    formats: ['cjs'],
                  },
                  rollupOptions: {
                    output: {
                      format: 'cjs',
                      entryFileNames: '[name].cjs',
                    },
                  },
                },
              },
            },
          ]),
          renderer(),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'renderer'),
    },
  },
  server: {
    port: 5173,
  },
});


