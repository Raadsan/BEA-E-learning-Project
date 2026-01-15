const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function seedPackages() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('--- Seeding Payment Packages ---');

        const packages = [
            {
                name: 'Student Package',
                description: '• Perfect for students\n• Essential features for learning\n• Easy access to study tools\n• Basic support\n• Affordable academic pricing',
                duration: 1, // 1 Month
                status: 'active'
            },
            {
                name: 'Standard Package',
                description: '• Full program access\n• Interactive learning tools\n• Priority email support\n• Progress tracking\n• Community access',
                duration: 3, // 3 Months
                status: 'active'
            },
            {
                name: 'Premium Plan',
                description: '• Complete course library\n• 1-on-1 session priority\n• 24/7 Premium support\n• Certificate of completion\n• Career coaching',
                duration: 12, // 1 Year
                status: 'active'
            }
        ];

        for (const pkg of packages) {
            // Check if package exists
            const [existing] = await connection.execute(
                'SELECT id FROM payment_packages WHERE package_name = ?',
                [pkg.name]
            );

            if (existing.length === 0) {
                await connection.execute(
                    'INSERT INTO payment_packages (package_name, description, duration_months, status) VALUES (?, ?, ?, ?)',
                    [pkg.name, pkg.description, pkg.duration, pkg.status]
                );
                console.log(`[SUCCESS] Added: ${pkg.name}`);
            } else {
                console.log(`[SKIP] Already exists: ${pkg.name}`);
            }
        }

        console.log('--- Seeding Complete ---');
    } catch (error) {
        console.error('[ERROR] Seeding failed:', error.message);
    } finally {
        await connection.end();
    }
}

seedPackages();
