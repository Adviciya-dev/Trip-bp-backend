const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const LAMBDA_DIR = path.join(ROOT, 'lambda-package');
const ZIP_PATH = path.join(ROOT, 'lambda.zip');

console.log('Packaging Lambda deployment...');

// Clean previous build
if (fs.existsSync(LAMBDA_DIR)) {
  fs.rmSync(LAMBDA_DIR, { recursive: true });
}
if (fs.existsSync(ZIP_PATH)) {
  fs.unlinkSync(ZIP_PATH);
}

fs.mkdirSync(LAMBDA_DIR, { recursive: true });

// Copy dist (compiled JS)
execSync(`cp -r ${DIST} ${LAMBDA_DIR}/dist`);

// Copy prisma schema (needed for migrations reference)
fs.mkdirSync(path.join(LAMBDA_DIR, 'prisma'), { recursive: true });
execSync(`cp ${path.join(ROOT, 'prisma', 'schema.prisma')} ${LAMBDA_DIR}/prisma/`);

// Copy package files and install production deps
execSync(`cp ${path.join(ROOT, 'package.json')} ${LAMBDA_DIR}/`);
execSync(`cp ${path.join(ROOT, 'package-lock.json')} ${LAMBDA_DIR}/`);

console.log('Installing production dependencies...');
execSync('npm ci --omit=dev', { cwd: LAMBDA_DIR, stdio: 'inherit' });

// Generate Prisma client inside lambda-package
console.log('Generating Prisma client for Lambda...');
execSync('npx prisma generate', { cwd: LAMBDA_DIR, stdio: 'inherit' });

// Remove non-Lambda Prisma engine binaries to save space
const prismaEngineDir = path.join(LAMBDA_DIR, 'node_modules', '.prisma', 'client');
if (fs.existsSync(prismaEngineDir)) {
  const files = fs.readdirSync(prismaEngineDir);
  for (const file of files) {
    // Keep only rhel (Lambda) engine binaries and JS/TS files
    if (file.includes('darwin') || file.includes('windows') || file.includes('debian')) {
      fs.unlinkSync(path.join(prismaEngineDir, file));
      console.log(`  Removed non-Lambda binary: ${file}`);
    }
  }
}

// Create zip
console.log('Creating zip...');
execSync(`cd ${LAMBDA_DIR} && zip -r -q ${ZIP_PATH} .`);

// Report size
const stats = fs.statSync(ZIP_PATH);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`\nLambda package created: lambda.zip (${sizeMB} MB)`);

// Cleanup
fs.rmSync(LAMBDA_DIR, { recursive: true });

console.log('Done!');
