import prisma from './src/lib/prisma.js';

async function main() {
  try {
    const program = await prisma.programs.findFirst();
    const subprogram = await prisma.subprograms.findFirst({
      where: { program_id: program.id }
    });

    if (!program || !subprogram) {
      console.log("No program or subprogram found!");
      return;
    }

    console.log(`Using program_id: ${program.id}, subprogram_id: ${subprogram.id}`);

    const entries = [
      {
        program_id: program.id,
        subprogram_id: subprogram.id,
        week_number: 1,
        day_of_week: "Saturday",
        activity_title: "Test Activity",
        activity_description: "Test Description",
        month: "June",
        year: 2026
      }
    ];

    console.log("Calling createMany...");
    const start = Date.now();
    const result = await prisma.timetables.createMany({
      data: entries.map(e => {
        const item = {
          ...e,
          program_id: parseInt(e.program_id),
          subprogram_id: parseInt(e.subprogram_id),
          week_number: parseInt(e.week_number),
          day: e.day || e.day_of_week
        };
        if (e.year) {
          item.year = parseInt(e.year);
        }
        delete item.day_of_week;
        return item;
      })
    });
    const duration = Date.now() - start;
    console.log("Success! Result:", result);
    console.log(`Duration: ${duration}ms`);

    console.log("Cleaning up test entries...");
    const deleteResult = await prisma.timetables.deleteMany({
      where: { activity_title: "Test Activity" }
    });
    console.log("Cleanup success. Deleted count:", deleteResult.count);
  } catch (err) {
    console.error("Failed with error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
