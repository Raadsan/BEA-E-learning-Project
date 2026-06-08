import prisma from './src/lib/prisma.js';

async function main() {
  try {
    const requests = await prisma.freezing_requests.findMany({
      orderBy: { created_at: 'desc' },
      take: 10
    });
    console.log("Latest freezing requests:");
    console.dir(requests, { depth: null });
  } catch (err) {
    console.error("Error reading freezing requests:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
