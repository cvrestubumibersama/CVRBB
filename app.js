// app.js — Universal Entry Point for cPanel Passenger & Standalone Hosting
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Jalankan Express Backend API di internal port 4000
const backendPath = path.resolve(__dirname, 'backend', 'src', 'index.js');
console.log(`[Passenger] Memulai Backend Express dari: ${backendPath}`);

const backendProcess = spawn(process.execPath, [backendPath], {
  env: {
    ...process.env,
    PORT: '4000',
    NODE_ENV: process.env.NODE_ENV || 'production',
  },
  stdio: 'inherit',
});

backendProcess.on('error', (err) => {
  console.error('[Passenger] Gagal menjalankan backend:', err);
});

process.on('exit', () => {
  backendProcess.kill();
});

// 2. Jalankan Frontend Nitro SSR pada port yang dialokasikan oleh cPanel Passenger
const passengerPort = process.env.PORT || 3000;
process.env.NITRO_PORT = String(passengerPort);
console.log(`[Passenger] Memulai Frontend Nitro pada port: ${passengerPort}`);

// Import Nitro production bundle
await import('./.output/server/index.mjs');
