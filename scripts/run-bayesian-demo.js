/**
 * Simple Node.js script to run the Bayesian demo
 * This compiles and runs the TypeScript demo file
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🚀 Starting Bayesian Update Engine Demo...\n');
  
  // Use tsx to run TypeScript directly
  const demoPath = path.join(__dirname, '../lib/bayesian-demo.ts');
  execSync(`npx tsx ${demoPath}`, { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
} catch (error) {
  console.error('❌ Error running demo:', error.message);
  process.exit(1);
}