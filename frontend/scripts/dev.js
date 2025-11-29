// Suppress baseline-browser-mapping warning by spawning Next.js and filtering output
const { spawn } = require('child_process');
const path = require('path');

// Find the next binary path
const nextBin = require.resolve('next/bin/next');

// Intercept all console and stream writes before spawning
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

process.stdout.write = function(chunk, encoding, fd) {
  if (chunk && (chunk.toString().includes('baseline-browser-mapping') || chunk.toString().includes('[baseline-browser-mapping]'))) {
    return true;
  }
  return originalStdoutWrite(chunk, encoding, fd);
};

process.stderr.write = function(chunk, encoding, fd) {
  if (chunk && (chunk.toString().includes('baseline-browser-mapping') || chunk.toString().includes('[baseline-browser-mapping]'))) {
    return true;
  }
  return originalStderrWrite(chunk, encoding, fd);
};

// Spawn next dev without shell to avoid deprecation warning
const nextProcess = spawn('node', [nextBin, 'dev'], {
  stdio: 'inherit',
  shell: false,
  cwd: path.join(__dirname, '..'),
  env: { ...process.env }
});

// Handle process signals
process.on('SIGINT', () => {
  nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM');
});

// Handle process exit
nextProcess.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle errors
nextProcess.on('error', (err) => {
  console.error('Error starting Next.js:', err);
  process.exit(1);
});

