import os from 'os';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('  Bitechez POS – System & Environment Precheck');
console.log('====================================================');

// 1. OS & Node
console.log(`OS: ${os.type()} ${os.release()} (${os.arch()})`);
console.log(`Node.js Version: ${process.version}`);
console.log(`CPUs: ${os.cpus().length} cores`);
console.log(`Total Memory: ${(os.totalmem() / (1024 * 1024 * 1024)).toFixed(2)} GB`);
console.log(`Free Memory: ${(os.freemem() / (1024 * 1024 * 1024)).toFixed(2)} GB`);

// 2. Project path
const rootDir = process.cwd();
console.log(`Working Directory: ${rootDir}`);

// 3. Env file check
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
} else {
  console.log('⚠️  .env file not found. Run "pnpm run setup:env"');
}

console.log('====================================================');
console.log('  Precheck Completed Successfully.');
console.log('====================================================');

