import http from 'http';
import app from './src/app.js';
import prisma from './src/lib/prisma.js';

const port = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 BEA Backend running at http://0.0.0.0:${port}`);
});

// Handle server errors (like port already in use)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${port} is already in use!`);
    console.error(`💡 TIP: Try running 'taskkill /F /IM node.exe' or choose a different port.\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

process.on('SIGINT', async () => {
  console.log('\nStopping server...');
  try {
    await prisma.$disconnect();
  } catch (e) {}
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  try {
    await prisma.$disconnect();
  } catch (e) {}
  server.close(() => {
    process.exit(0);
  });
});
