#!/usr/bin/env node

/**
 * Build Validation Script
 * Checks for common build issues before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let hasErrors = false;
let hasWarnings = false;

function log(message, type = 'info') {
  const prefix = type === 'error' ? `${RED}✗` : 
                 type === 'warning' ? `${YELLOW}⚠` : 
                 type === 'success' ? `${GREEN}✓` : '•';
  console.log(`${prefix} ${message}${RESET}`);
}

function checkUntrackedImports() {
  log('Checking for untracked imported files...');
  
  try {
    // Get list of untracked files
    const untrackedFiles = execSync('git ls-files --others --exclude-standard', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    // Get all TypeScript/JavaScript files
    const sourceFiles = execSync('git ls-files "*.ts" "*.tsx" "*.js" "*.jsx"', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    const untrackedImports = new Set();
    
    for (const file of sourceFiles) {
      if (!fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf-8');
      const importRegex = /import\s+(?:.*?\s+from\s+)?['"](\.{1,2}\/[^'"]+|@\/[^'"]+)['"]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        let resolvedPath;
        
        if (importPath.startsWith('@/')) {
          // Handle TypeScript path aliases
          resolvedPath = importPath.replace('@/', 'src/');
        } else if (importPath.startsWith('.')) {
          // Handle relative imports
          const dir = path.dirname(file);
          resolvedPath = path.join(dir, importPath);
        } else {
          continue; // Skip node_modules imports
        }
        
        // Check various extensions
        const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'];
        
        for (const ext of extensions) {
          const fullPath = resolvedPath + ext;
          if (untrackedFiles.includes(fullPath)) {
            untrackedImports.add(`${file} imports untracked file: ${fullPath}`);
            hasErrors = true;
          }
        }
      }
    }
    
    if (untrackedImports.size > 0) {
      log('Found untracked files that are imported:', 'error');
      untrackedImports.forEach(msg => log(`  ${msg}`, 'error'));
      return false;
    }
    
    log('All imported files are tracked', 'success');
    return true;
  } catch (error) {
    log(`Error checking imports: ${error.message}`, 'error');
    return false;
  }
}

function checkRequiredFiles() {
  log('Checking required files...');
  
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    'src/app/layout.tsx',
    'src/app/page.tsx'
  ];
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
      hasErrors = true;
    }
  }
  
  if (missingFiles.length > 0) {
    log('Missing required files:', 'error');
    missingFiles.forEach(file => log(`  ${file}`, 'error'));
    return false;
  }
  
  log('All required files present', 'success');
  return true;
}

function checkEnvironmentVariables() {
  log('Checking environment variables...');
  
  // Check for sensitive variables with NEXT_PUBLIC prefix
  const envFiles = ['.env', '.env.local', '.env.production', '.env.development']
    .filter(fs.existsSync);
  
  const sensitivePublicVars = [];
  
  for (const envFile of envFiles) {
    const content = fs.readFileSync(envFile, 'utf-8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.trim().startsWith('#') || !line.includes('=')) continue;
      
      const [key] = line.split('=');
      if (key.startsWith('NEXT_PUBLIC_') && 
          (key.includes('PASSWORD') || key.includes('SECRET') || key.includes('KEY') || key.includes('TOKEN'))) {
        sensitivePublicVars.push(`${key} in ${envFile}`);
        hasWarnings = true;
      }
    }
  }
  
  if (sensitivePublicVars.length > 0) {
    log('Sensitive variables exposed to client:', 'warning');
    sensitivePublicVars.forEach(v => log(`  ${v}`, 'warning'));
    log('  Consider moving these to server-side only', 'warning');
  }
  
  // Check for required env vars
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const envContent = envFiles.map(f => fs.readFileSync(f, 'utf-8')).join('\n');
  const missingVars = requiredEnvVars.filter(v => !envContent.includes(v));
  
  if (missingVars.length > 0) {
    log('Missing required environment variables:', 'error');
    missingVars.forEach(v => log(`  ${v}`, 'error'));
    hasErrors = true;
    return false;
  }
  
  log('Environment variables checked', 'success');
  return true;
}

function checkBuildConfiguration() {
  log('Checking build configuration...');
  
  // Check next.config.js
  if (fs.existsSync('next.config.js')) {
    const config = fs.readFileSync('next.config.js', 'utf-8');
    
    if (config.includes('ignoreBuildErrors: true')) {
      log('TypeScript errors are being ignored in build', 'warning');
      log('  Consider fixing TypeScript errors instead', 'warning');
      hasWarnings = true;
    }
    
    if (config.includes('ignoreDuringBuilds: true')) {
      log('ESLint errors are being ignored in build', 'warning');
      log('  Consider fixing ESLint errors instead', 'warning');
      hasWarnings = true;
    }
  }
  
  // Check for large bundle size issues
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const buildScript = pkg.scripts?.build || '';
    
    if (buildScript.includes('--max-old-space-size')) {
      log('Build requires increased memory allocation', 'warning');
      log('  Consider optimizing bundle size', 'warning');
      hasWarnings = true;
    }
  }
  
  log('Build configuration checked', 'success');
  return true;
}

function checkGitStatus() {
  log('Checking git status...');
  
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    const lines = status.split('\n').filter(Boolean);
    
    const modifiedSrcFiles = lines.filter(l => l.includes('src/') && l.startsWith(' M'));
    const untrackedSrcFiles = lines.filter(l => l.includes('src/') && l.startsWith('??'));
    
    if (modifiedSrcFiles.length > 0) {
      log('Modified source files not committed:', 'warning');
      modifiedSrcFiles.forEach(f => log(`  ${f}`, 'warning'));
      hasWarnings = true;
    }
    
    if (untrackedSrcFiles.length > 0) {
      log('Untracked source files:', 'warning');
      untrackedSrcFiles.forEach(f => log(`  ${f}`, 'warning'));
      hasWarnings = true;
    }
    
    if (modifiedSrcFiles.length === 0 && untrackedSrcFiles.length === 0) {
      log('Git repository is clean', 'success');
    }
    
    return true;
  } catch (error) {
    log(`Error checking git status: ${error.message}`, 'error');
    return false;
  }
}

// Main execution
console.log(`\n${GREEN}Build Validation Script${RESET}`);
console.log('========================\n');

checkRequiredFiles();
checkUntrackedImports();
checkEnvironmentVariables();
checkBuildConfiguration();
checkGitStatus();

console.log('\n========================');
if (hasErrors) {
  console.log(`${RED}✗ Build validation failed with errors${RESET}`);
  console.log('Please fix the errors above before deploying.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log(`${YELLOW}⚠ Build validation passed with warnings${RESET}`);
  console.log('Consider addressing the warnings above.\n');
  process.exit(0);
} else {
  console.log(`${GREEN}✓ Build validation passed successfully${RESET}\n`);
  process.exit(0);
}