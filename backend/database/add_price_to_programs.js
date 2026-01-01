// database/add_price_to_programs.js
import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config();

const dbp = db.promise();

async function addPriceToPrograms() {
    try {
        console.log("🔄 Adding price and discount columns to programs table...");

        // Check if price column exists
        const [priceCheck] = await dbp.query(
            `SELECT COUNT(*) as count 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'programs' 
       AND COLUMN_NAME = 'price'`,
            [process.env.DB_NAME]
        );

        if (priceCheck[0].count === 0) {
            await dbp.query(
                `ALTER TABLE programs 
         ADD COLUMN price DECIMAL(10, 2) DEFAULT 0.00,
         ADD COLUMN discount DECIMAL(10, 2) DEFAULT 0.00`
            );
            console.log("✅ Added price and discount columns");
        } else {
            console.log("ℹ️  price column already exists");
        }

        console.log("\n✅ Programs table schema updated successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating programs schema:", err);
        process.exit(1);
    }
}

addPriceToPrograms();
