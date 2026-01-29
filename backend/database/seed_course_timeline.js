import db from './dbconfig.js';

const dbp = db.promise();

// Original timeline data from timelineData.js
const timelineData = [
    {
        termSerial: "BEA-01",
        startDate: "2026-01-31",
        endDate: "2026-02-25",
        holidays: ""
    },
    {
        termSerial: "BEA-02",
        startDate: "2026-03-07",
        endDate: "2026-04-08",
        holidays: "19th to the 20th of March 2026—Eid-Alfitr Celebration"
    },
    {
        termSerial: "BEA-03",
        startDate: "2026-04-18",
        endDate: "2026-05-06",
        holidays: "26th of May 2026 Eid-Al-adha Celebration"
    },
    {
        termSerial: "BEA-04",
        startDate: "2026-05-16",
        endDate: "2026-06-10",
        holidays: ""
    },
    {
        termSerial: "BEA-05",
        startDate: "2026-06-20",
        endDate: "2026-07-18",
        holidays: "26th of June to the 1st of July 2026— Somali Independence Week"
    },
    {
        termSerial: "BEA-06",
        startDate: "2026-07-25",
        endDate: "2026-08-12",
        holidays: ""
    },
    {
        termSerial: "BEA-07",
        startDate: "2026-08-22",
        endDate: "2026-09-16",
        holidays: ""
    },
    {
        termSerial: "BEA-08",
        startDate: "2026-09-23",
        endDate: "2026-10-21",
        holidays: ""
    },
    {
        termSerial: "BEA-09",
        startDate: "2026-10-31",
        endDate: "2026-11-25",
        holidays: "21st of November 2026—Somali Teachers' Day"
    },
    {
        termSerial: "BEA-10",
        startDate: "2026-12-05",
        endDate: "2026-12-30",
        holidays: ""
    }
];

const seedCourseTimeline = async () => {
    try {
        // Check if data already exists
        const [existing] = await dbp.query('SELECT COUNT(*) as count FROM course_timeline');

        if (existing[0].count > 0) {
            console.log(`⚠ course_timeline table already has ${existing[0].count} records`);
            console.log('Skipping seed to avoid duplicates. Delete existing records first if you want to re-seed.');
            process.exit(0);
        }

        // Insert timeline data
        const insertQuery = `
      INSERT INTO course_timeline (term_serial, start_date, end_date, holidays, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, TRUE)
    `;

        for (let i = 0; i < timelineData.length; i++) {
            const item = timelineData[i];
            await dbp.query(insertQuery, [
                item.termSerial,
                item.startDate,
                item.endDate,
                item.holidays || null,
                i + 1 // display_order starts from 1
            ]);
            console.log(`✓ Inserted ${item.termSerial}`);
        }

        console.log(`\n✓ Successfully seeded ${timelineData.length} timeline entries`);
        process.exit(0);
    } catch (error) {
        console.error('✗ Error seeding course_timeline:', error);
        process.exit(1);
    }
};

seedCourseTimeline();
