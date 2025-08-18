// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = 3000;
const hostname = '0.0.0.0';

// Store server and io instances for hot reloading
let server: ReturnType<typeof createServer>;
let io: Server;

// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      // In production, use the current directory where .next is located
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server that will handle both Next.js and Socket.IO
    server = createServer((req, res) => {
      // Skip socket.io requests from Next.js handler
      if (req.url?.startsWith('/socket.io')) {
        return;
      }
      handle(req, res);
    });

    // Setup Socket.IO
    io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    setupSocket(io);

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Handle hot reloading in development
if (dev && module.hot) {
  module.hot.accept('./src/lib/socket', () => {
    console.log('Socket handler updated, reinitializing Socket.IO');
    if (io) {
      // Clean up existing connections
      io.removeAllListeners();
      // Re-setup socket with new handler
      setupSocket(io);
    }
  });

  module.hot.dispose(() => {
    if (server) {
      server.close();
    }
  });
}

// Start the server
createCustomServer();
