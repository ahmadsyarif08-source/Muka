import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static assets from dist
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback: send index.html for all other GET requests
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .once('listening', () => {
        tester.close(() => resolve(false));
      })
      .listen(port, '0.0.0.0');
  });
}

async function startServer() {
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : null;
  let portToUse = 3000;

  if (envPort && envPort !== 3000) {
    const inUse = await isPortInUse(envPort);
    if (!inUse) {
      portToUse = envPort;
    } else {
      portToUse = 3000;
    }
  }

  app.listen(portToUse, '0.0.0.0', () => {
    console.log(`SiPramuka production server running on http://0.0.0.0:${portToUse}`);
  });
}

startServer();
