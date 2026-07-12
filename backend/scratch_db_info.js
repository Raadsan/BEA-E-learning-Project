import prisma from './src/lib/prisma.js';

async function main() {
  try {
    const tableInfo = await prisma.$queryRaw`DESCRIBE exam_submissions`;
    console.log("exam_submissions table schema:", JSON.stringify(tableInfo, null, 2));

    const examsInfo = await prisma.$queryRaw`DESCRIBE exams`;
    console.log("exams table schema:", JSON.stringify(examsInfo, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
