#!/usr/bin/env node
import { spawn } from 'child_process';
import { platform } from 'os';

const isWindows = platform() === 'win32';

const env = {
  ...process.env,
  NODE_ENV: 'development',
  HOST: '127.0.0.1',
  PORT: '5000'
};

const command = isWindows ? 'npx.cmd' : 'npx';
const args = ['tsx', 'server/index.ts'];

const child = spawn(command, args, {
  env,
  stdio: 'inherit',
  shell: true
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
