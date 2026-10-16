#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Fix permissions recursively for the admin folder
function fixPermissions(dir) {
  try {
    if (!fs.existsSync(dir)) return;
    
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      try {
        if (entry.isDirectory()) {
          fs.chmodSync(fullPath, 0o755);
          fixPermissions(fullPath);
        } else {
          fs.chmodSync(fullPath, 0o644);
        }
      } catch (err) {
        console.log(`Could not fix permissions for ${fullPath}`);
      }
    });
  } catch (err) {
    console.log(`Could not process directory ${dir}`);
  }
}

console.log('Fixing permissions for app directory...');
fixPermissions(path.join(__dirname, 'app'));
console.log('Permissions fixed!');
