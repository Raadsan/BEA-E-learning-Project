import prisma from '../src/lib/prisma.js';

const LOCATION = 'BEA Campus, Mogadishu';

const UPLOAD_IMAGES = [
  '/uploads/1781166086783-338218869.jpg',
  '/uploads/1781166214569-210097113.jpg',
  '/uploads/1781166128447-507149131.jpg',
  '/uploads/1781166150838-356956115.jpg',
  '/uploads/1781166179815-173773193.jpg',
  '/uploads/1781333471276-131164421.jpg',
];

const newsRecords = [
  {
    title: 'BEA Celebrates 500+ IELTS Graduates',
    description: 'Over 500 students have achieved their target IELTS scores through our preparation program this year.',
    event_date: new Date('2026-05-15T10:00:00'),
    type: 'news',
    status: 'active',
    location: LOCATION,
    image_url: UPLOAD_IMAGES[0],
  },
  {
    title: 'New Digital Literacy Program Launched',
    description: 'BEA introduces Digital Literacy and Virtual Communication Skills for the modern workplace.',
    event_date: new Date('2026-05-10T09:00:00'),
    type: 'news',
    status: 'active',
    location: LOCATION,
    image_url: UPLOAD_IMAGES[1],
  },
  {
    title: 'Partnership with Oxford University Press',
    description: 'BEA continues its partnership with Oxford University Press, bringing English File 4th Edition to classrooms.',
    event_date: new Date('2026-05-05T11:00:00'),
    type: 'news',
    status: 'active',
    location: LOCATION,
    image_url: UPLOAD_IMAGES[2],
  },
  {
    title: 'Student Wins Regional English Competition',
    description: 'Congratulations to our Level 6 student who won first place in the Regional English Speaking Competition.',
    event_date: new Date('2026-04-28T14:00:00'),
    type: 'news',
    status: 'active',
    location: LOCATION,
    image_url: UPLOAD_IMAGES[3],
  },
  {
    title: 'Extended Evening Classes Available',
    description: 'Working professionals can now join evening classes from 6:00 PM to 9:00 PM at BEA.',
    event_date: new Date('2026-04-20T18:00:00'),
    type: 'news',
    status: 'active',
    location: LOCATION,
    image_url: UPLOAD_IMAGES[4],
  },
];

const eventRecords = [
  {
    title: 'BEA Open Day 2026',
    description: 'Campus tour, meet our teachers, and free placement tests for new students.',
    event_date: new Date('2026-06-15T09:00:00'),
    type: 'event',
    status: 'active',
    location: LOCATION,
    image_url: UPLOAD_IMAGES[5],
  },
  {
    title: 'IELTS Preparation Workshop',
    description: 'One-day workshop covering all four IELTS modules with expert tips and practice.',
    event_date: new Date('2026-06-22T10:00:00'),
    type: 'training',
    status: 'active',
    location: LOCATION,
    image_url: UPLOAD_IMAGES[0],
  },
  {
    title: 'New Term Registration Opens',
    description: 'Registration for the July 2026 term begins. Early bird discounts for the first 50 students.',
    event_date: new Date('2026-07-01T08:00:00'),
    type: 'deadline',
    status: 'active',
    location: LOCATION,
    image_url: UPLOAD_IMAGES[1],
  },
  {
    title: 'English Speaking Competition',
    description: 'Annual inter-class English speaking competition with prizes for top performers.',
    event_date: new Date('2026-07-15T14:00:00'),
    type: 'event',
    status: 'active',
    location: LOCATION,
    image_url: UPLOAD_IMAGES[2],
  },
  {
    title: 'Winter Semester Finals',
    description: 'Final examinations for all major programs. Students must arrive 30 minutes early.',
    event_date: new Date('2026-08-01T08:30:00'),
    type: 'exam',
    status: 'active',
    location: LOCATION,
    image_url: UPLOAD_IMAGES[3],
  },
];

async function main() {
  console.log('Seeding news & events...');

  for (const record of [...newsRecords, ...eventRecords]) {
    await prisma.news_events.create({ data: record });
    console.log(`  + [${record.type}] ${record.title}`);
  }

  const newsCount = await prisma.news_events.count({ where: { type: 'news' } });
  const eventCount = await prisma.news_events.count({
    where: { type: { in: ['exam', 'event', 'deadline', 'training'] } },
  });

  console.log(`\nDone. Database now has ${newsCount} news and ${eventCount} events.`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
