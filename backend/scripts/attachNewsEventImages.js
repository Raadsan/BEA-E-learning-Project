import prisma from '../src/lib/prisma.js';

const UPLOAD_IMAGES = [
  '/uploads/1781166086783-338218869.jpg',
  '/uploads/1781166214569-210097113.jpg',
  '/uploads/1781166128447-507149131.jpg',
  '/uploads/1781166150838-356956115.jpg',
  '/uploads/1781166179815-173773193.jpg',
  '/uploads/1781333471276-131164421.jpg',
];

async function main() {
  const records = await prisma.news_events.findMany({
    where: { OR: [{ image_url: null }, { image_url: '' }] },
    orderBy: { id: 'asc' },
  });

  if (records.length === 0) {
    console.log('All news/events already have images.');
    return;
  }

  console.log(`Updating ${records.length} record(s) with images...`);

  for (let i = 0; i < records.length; i++) {
    const image_url = UPLOAD_IMAGES[i % UPLOAD_IMAGES.length];
    await prisma.news_events.update({
      where: { id: records[i].id },
      data: { image_url },
    });
    console.log(`  ✓ [${records[i].type}] ${records[i].title} → ${image_url}`);
  }

  console.log('\nDone.');
}

main()
  .catch((err) => {
    console.error('Update failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
