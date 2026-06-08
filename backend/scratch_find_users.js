import prisma from './src/lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Find student
    const student = await prisma.students.findFirst();
    if (student) {
      console.log(`Found student: Name: ${student.full_name}, Email: ${student.email}`);
      await prisma.students.update({
        where: { student_id: student.student_id },
        data: { password: hashedPassword }
      });
      console.log("Updated student password to: password123");
    } else {
      console.log("No student found");
    }

    // Find admin
    const admin = await prisma.admins.findFirst();
    if (admin) {
      console.log(`Found admin: Username: ${admin.username}, Email: ${admin.email}`);
      await prisma.admins.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      });
      console.log("Updated admin password to: password123");
    } else {
      console.log("No admin found");
    }

  } catch (err) {
    console.error("Error updating passwords:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
