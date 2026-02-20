#!/usr/bin/env node

const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');

const mainScript = path.join(__dirname, '..');
const args = [mainScript, ...process.argv.slice(2)];

const child = spawn(electron, args, { stdio: 'inherit' });

child.on('close', code => {
  process.exit(code);
});
