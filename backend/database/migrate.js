import db from './dbconfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbp = db.promise();

/**
 * Advanced Database Migration Manager
 * 
 * Usage:
 * node migrate.js                   - Runs all pending migrations in the schema folder
 * node migrate.js status            - Shows which migrations have been applied
 * node migrate.js schema/file.sql   - Runs a specific SQL file
 */

async function ensureMigrationTable() {
    await dbp.query(`
        CREATE TABLE IF NOT EXISTS _migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function getAppliedMigrations() {
    const [rows] = await dbp.query('SELECT filename FROM _migrations');
    return rows.map(r => r.filename);
}

async function markAsApplied(filename) {
    await dbp.query('INSERT INTO _migrations (filename) VALUES (?)', [filename]);
}

async function runSqlFile(filePath) {
    const filename = path.basename(filePath);
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log(`\n🚀 [Migrating] ${filename}...`);

        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

        for (const statement of statements) {
            await dbp.query(statement);
        }

        await markAsApplied(filename);
        console.log(`✅ [Success] Applied ${filename}`);
        return true;
    } catch (err) {
        console.error(`❌ [Failed] ${filename}:`, err.message);
        return false;
    }
}

async function main() {
    const arg = process.argv[2];
    const schemaDir = path.join(__dirname, 'schema');

    try {
        await ensureMigrationTable();
        const applied = await getAppliedMigrations();

        // 1. Check if user wants status
        if (arg === 'status') {
            console.log('\n📊 Database Migration Status:');
            const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.sql'));
            files.forEach(f => {
                const status = applied.includes(f) ? '✅ APPLIED' : '⏳ PENDING';
                console.log(`  ${status.padEnd(10)} | ${f}`);
            });
            process.exit(0);
        }

        // 2. Check if user provided a specific file
        if (arg && arg.endsWith('.sql')) {
            const fullPath = path.isAbsolute(arg) ? arg : path.join(__dirname, arg);
            if (!fs.existsSync(fullPath)) {
                console.error(`❌ File not found: ${fullPath}`);
                process.exit(1);
            }
            if (applied.includes(path.basename(fullPath))) {
                console.warn(`ℹ️ File ${path.basename(fullPath)} was already applied.`);
                process.exit(0);
            }
            const success = await runSqlFile(fullPath);
            process.exit(success ? 0 : 1);
        }

        // 3. Default: Run all pending migrations in schema directory
        console.log('🔄 Checking for pending migrations in backend/database/schema...');
        const allFiles = fs.readdirSync(schemaDir)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Run in alphabetical order

        const pending = allFiles.filter(f => !applied.includes(f));

        if (pending.length === 0) {
            console.log('✨ No pending migrations. Your database is up to date.');
            process.exit(0);
        }

        console.log(`📂 Found ${pending.length} pending migrations.`);
        for (const file of pending) {
            const success = await runSqlFile(path.join(schemaDir, file));
            if (!success) {
                console.error('\n🛑 Migration batch stopped due to error.');
                process.exit(1);
            }
        }

        console.log('\n🎉 All pending migrations applied successfully!');
        process.exit(0);

    } catch (err) {
        console.error('💥 Critical Error:', err);
        process.exit(1);
    }
}

main();
