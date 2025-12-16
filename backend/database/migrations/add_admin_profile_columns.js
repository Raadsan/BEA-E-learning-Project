// Script to add admin profile columns to database
// Run this file with: node backend/database/migrations/add_admin_profile_columns.js

import db from '../dbconfig.js';

const addAdminProfileColumns = async () => {
    const connection = db.promise();

    try {
        console.log('🔄 Starting database migration...');

        // Helper function to check if column exists
        const columnExists = async (tableName, columnName) => {
            const [rows] = await connection.query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = ? 
        AND COLUMN_NAME = ?
      `, [tableName, columnName]);
            return rows[0].count > 0;
        };

        // Add username column
        if (!await columnExists('admins', 'username')) {
            console.log('📝 Adding username column...');
            await connection.query(`ALTER TABLE admins ADD COLUMN username VARCHAR(100) UNIQUE`);
        } else {
            console.log('⏭️  username column already exists');
        }

        // Add full_name column
        if (!await columnExists('admins', 'full_name')) {
            console.log('📝 Adding full_name column...');
            await connection.query(`ALTER TABLE admins ADD COLUMN full_name VARCHAR(200)`);
        } else {
            console.log('⏭️  full_name column already exists');
        }

        // Add bio column
        if (!await columnExists('admins', 'bio')) {
            console.log('📝 Adding bio column...');
            await connection.query(`ALTER TABLE admins ADD COLUMN bio TEXT`);
        } else {
            console.log('⏭️  bio column already exists');
        }

        // Add profile_image column
        if (!await columnExists('admins', 'profile_image')) {
            console.log('📝 Adding profile_image column...');
            await connection.query(`ALTER TABLE admins ADD COLUMN profile_image VARCHAR(500)`);
        } else {
            console.log('⏭️  profile_image column already exists');
        }

        // Update existing records with username from email
        console.log('🔄 Updating existing records with usernames...');
        await connection.query(`
      UPDATE admins 
      SET username = SUBSTRING_INDEX(email, '@', 1) 
      WHERE username IS NULL OR username = ''
    `);

        // Make first_name and last_name nullable
        console.log('📝 Making first_name and last_name nullable...');
        await connection.query(`
      ALTER TABLE admins 
      MODIFY COLUMN first_name VARCHAR(100) NULL
    `);

        await connection.query(`
      ALTER TABLE admins 
      MODIFY COLUMN last_name VARCHAR(100) NULL
    `);

        console.log('✅ Migration completed successfully!');
        console.log('✅ Columns ready: username, full_name, bio, profile_image');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

addAdminProfileColumns();
