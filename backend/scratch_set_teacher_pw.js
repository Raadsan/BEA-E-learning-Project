import prisma from './src/lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const teacher = await prisma.teachers.findFirst();
    if (teacher) {
      await prisma.teachers.update({
        where: { id: teacher.id },
        data: { password: hashedPassword }
      });
      console.log(`Updated teacher password: ${teacher.full_name} | Email: ${teacher.email} | Password: password123`);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
