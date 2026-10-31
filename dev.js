import { spawn } from 'child_process';
import path from 'path';

console.log('\x1b[36m[mystery-dev]\x1b[0m Starting backend (server) and frontend (client)...');

const nodemonBin = path.resolve('./server/node_modules/nodemon/bin/nodemon.js');
const viteBin = path.resolve('./client/node_modules/vite/bin/vite.js');

const server = spawn(process.execPath, [nodemonBin, 'index.js'], {
  cwd: './server',
  stdio: ['ignore', 'inherit', 'inherit'],
});

const client = spawn(process.execPath, [viteBin], {
  cwd: './client',
  stdio: ['ignore', 'inherit', 'inherit'],
});

function cleanup() {
  console.log('\n\x1b[36m[mystery-dev]\x1b[0m Shutting down servers...');
  try { server.kill(); } catch {}
  try { client.kill(); } catch {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

server.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\x1b[31m[server] exited with code ${code}\x1b[0m`);
  }
});

client.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\x1b[31m[client] exited with code ${code}\x1b[0m`);
  }
});
