// Build script to bundle all modular ES files into a single standalone bundle.js
// This eliminates browser CORS restrictions when opened directly via file:///
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const jsDir = path.join(projectRoot, 'js');
const modulesDir = path.join(jsDir, 'modules');

console.log('Reading source files...');

function stripImportsExports(code) {
  return code
    // Remove import statements
    .replace(/^\s*import\s+.*?;?\s*$/gm, '')
    // Remove export { ... }
    .replace(/^\s*export\s*\{.*?\};?\s*$/gm, '')
    // Remove 'export default'
    .replace(/^\s*export\s+default\s+/gm, '')
    // Replace 'export function' with 'function'
    .replace(/^\s*export\s+function\s+/gm, 'function ')
    // Replace 'export const' with 'const'
    .replace(/^\s*export\s+const\s+/gm, 'const ')
    // Replace 'export class' with 'class'
    .replace(/^\s*export\s+class\s+/gm, 'class ')
    // Replace 'export let' with 'let'
    .replace(/^\s*export\s+let\s+/gm, 'let ');
}

const audioCode = stripImportsExports(fs.readFileSync(path.join(jsDir, 'audio.js'), 'utf8'));
const stateCode = stripImportsExports(fs.readFileSync(path.join(jsDir, 'state.js'), 'utf8'));
const contentCode = stripImportsExports(fs.readFileSync(path.join(jsDir, 'content-data.js'), 'utf8'));

const moduleFiles = [
  'data-cleaning.js',
  'sql-arena.js',
  'eda-stats.js',
  'bi-dashboard.js',
  'ab-testing.js',
  'feature-engineering.js',
  'regression.js',
  'classification.js',
  'clustering-pca.js',
  'confusion-matrix.js',
  'neural-net.js',
  'time-series.js'
];

let modulesCode = '';
for (const file of moduleFiles) {
  const filePath = path.join(modulesDir, file);
  modulesCode += `\n// ==================== Module: ${file} ====================\n`;
  modulesCode += stripImportsExports(fs.readFileSync(filePath, 'utf8')) + '\n';
}

const labWrapperCode = stripImportsExports(fs.readFileSync(path.join(jsDir, 'lab-wrapper.js'), 'utf8'));
const uiCode = stripImportsExports(fs.readFileSync(path.join(jsDir, 'ui.js'), 'utf8'));
const appCode = stripImportsExports(fs.readFileSync(path.join(jsDir, 'app.js'), 'utf8'));

const bundleContent = `/**
 * DataQuest Arcade - Standalone Unified Bundle
 * Zero-dependency, offline-ready, runs locally via file:/// or HTTP without CORS errors.
 */
(function() {
  'use strict';

  // ==================== Audio Engine ====================
  ${audioCode}

  // ==================== Game State & Persistence ====================
  ${stateCode}

  // ==================== Curriculum Content Knowledge Base ====================
  ${contentCode}

  // ==================== 12 Interactive Modules ====================
  ${modulesCode}

  // ==================== Lab Wrapper & Perspectives ====================
  ${labWrapperCode}

  // ==================== UI Controller & Codex ====================
  ${uiCode}

  // ==================== App Orchestration & Entry ====================
  ${appCode}

})();
`;

fs.writeFileSync(path.join(projectRoot, 'bundle.js'), bundleContent, 'utf8');
console.log('Successfully generated bundle.js (' + Math.round(bundleContent.length / 1024) + ' KB)!');
