import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const examplePath = path.join(rootDir, '.env.example');
const targetPath = path.join(rootDir, '.env');

console.log('[Bitechez Env Setup] Preparing environment templates...');

if (!fs.existsSync(examplePath)) {
  console.error('❌ .env.example not found!');
  process.exit(1);
}

if (!fs.existsSync(targetPath)) {
  fs.copyFileSync(examplePath, targetPath);
  console.log('✅ Created root .env from .env.example');
} else {
  console.log('ℹ️  .env already exists, skipping overwrite.');
}

console.log('🎉 Environment setup complete.');

