import prisma from './src/lib/prisma.js';

async function main() {
  try {
    // Find first teacher with assigned classes
    const teacher = await prisma.teachers.findFirst({
      where: { classes: { some: {} } },
      include: { classes: { include: { subprograms: { include: { programs: true } }, _count: { select: { students: true } } } } }
    });

    if (!teacher) {
      console.log("No teacher with classes found. Finding any teacher...");
      const anyTeacher = await prisma.teachers.findFirst();
      console.log("Teacher:", anyTeacher?.id, anyTeacher?.full_name, anyTeacher?.email);
      return;
    }

    console.log(`Teacher: ${teacher.full_name} (ID: ${teacher.id}, Email: ${teacher.email})`);
    console.log(`Classes assigned: ${teacher.classes.length}`);
    teacher.classes.forEach(cls => {
      console.log(`  - Class: "${cls.class_name}" | Subprogram: "${cls.subprograms?.subprogram_name || 'N/A'}" | Students: ${cls._count?.students}`);
    });

    const classIds = teacher.classes.map(c => c.id);
    const students = classIds.length > 0
      ? await prisma.students.findMany({ where: { class_id: { in: classIds } } })
      : [];

    console.log(`Total students across teacher classes: ${students.length}`);

    const programSet = new Set();
    teacher.classes.forEach(c => { if (c.subprograms?.programs?.id) programSet.add(c.subprograms.programs.id); });
    console.log(`Unique programs: ${programSet.size}`);

    // Test attendance for current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const attendanceCount = classIds.length > 0
      ? await prisma.attendance.count({ where: { class_id: { in: classIds }, date: { gte: firstDay, lte: lastDay } } })
      : 0;
    console.log(`Attendance records this month: ${attendanceCount}`);

    console.log("\n✅ Dashboard stats endpoint would return:");
    console.log({
      fullName: teacher.full_name,
      totalClasses: teacher.classes.length,
      totalStudents: students.length,
      activeStudents: students.length,
      totalPrograms: programSet.size,
      studentGrowth: 0
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
