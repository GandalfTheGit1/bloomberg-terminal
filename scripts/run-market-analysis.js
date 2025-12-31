#!/usr/bin/env node

/**
 * Script to run market analysis demo
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Market Analysis Demo...\n');

try {
  // Check if TypeScript is compiled
  const tsFile = path.join(__dirname, '../examples/market-analysis-demo.ts');
  const jsFile = path.join(__dirname, '../examples/market-analysis-demo.js');
  
  // Compile TypeScript if needed
  console.log('📦 Compiling TypeScript...');
  execSync('npx tsc examples/market-analysis-demo.ts --outDir examples --target es2020 --module commonjs --esModuleInterop --skipLibCheck', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  // Run the demo
  console.log('🎯 Running market analysis...');
  execSync('node examples/market-analysis-demo.js', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
} catch (error) {
  console.error('❌ Error running demo:', error.message);
  console.log('\n💡 Make sure you have:');
  console.log('   1. Set up API keys in .env.local file');
  console.log('   2. Installed dependencies with: npm install');
  console.log('   3. Check the setup guide: docs/REAL-DATA-SETUP.md');
  process.exit(1);
}