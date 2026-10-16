#!/usr/bin/env node
// `next start` (unlike `next dev`) exits on EADDRINUSE instead of trying the
// next port — this finds a free port starting at PORT (default 3000) and
// launches the production server on it.
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

const desiredPort = Number(process.env.PORT) || 3000;
const maxAttempts = 20;

function isPortFree(port) {
  // No host passed — matches how `next start` itself binds (server.listen(port,
  // hostname) with hostname undefined unless -H is given). Testing against a
  // different address (e.g. explicit '0.0.0.0') can under-report conflicts on
  // Windows, where that's a distinct socket from the unspecified/dual-stack one.
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once('error', () => resolve(false));
    tester.once('listening', () => tester.close(() => resolve(true)));
    tester.listen(port);
  });
}

async function findFreePort(startPort) {
  let port = startPort;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (await isPortFree(port)) return port;
    port += 1;
  }
  throw new Error(`Could not find a free port after trying ${startPort}-${port - 1}.`);
}

async function main() {
  const port = await findFreePort(desiredPort);
  if (port !== desiredPort) {
    console.log(`Port ${desiredPort} is already in use — starting on ${port} instead.`);
  }

  const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
  const child = spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
