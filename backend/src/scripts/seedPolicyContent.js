import prisma from '../lib/prisma.js';
import { systemPolicySeedContent } from '../constants/policySeedContent.js';

async function main() {
    const entries = Object.entries(systemPolicySeedContent);

    for (const [slug, content] of entries) {
        await prisma.policies.updateMany({
            where: { slug },
            data: {
                content: JSON.stringify(content),
            },
        });
    }

    console.log(`Seeded policy content for ${entries.length} system policies.`);
}

main()
    .catch((error) => {
        console.error('Failed to seed policy content:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
