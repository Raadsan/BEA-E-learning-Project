// check_class_schedules_table.js
import db from "./dbconfig.js";

const checkTable = async () => {
  try {
    const [rows] = await db.promise().query("SHOW TABLES LIKE 'class_schedules'");
    console.log("class_schedules table exists:", rows.length > 0);
    process.exit(0);
  } catch (error) {
    console.error("Error checking table:", error);
    process.exit(1);
  }
};

checkTable();