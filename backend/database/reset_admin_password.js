// database/reset_admin_password.js
import db from "./dbconfig.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const dbp = db.promise();

async function resetAdminPassword() {
  try {
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@bea.com';
    const newPassword = 'admin12'; // Set to the password user is trying to use
    
    console.log(`🔄 Resetting password for admin: ${email}`);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the admin password
    const [result] = await dbp.query(
      "UPDATE admins SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );
    
    if (result.affectedRows > 0) {
      console.log(`✅ Password reset successfully for ${email}`);
      console.log(`📝 New password: ${newPassword}`);
    } else {
      console.log(`⚠️  No admin found with email: ${email}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error resetting admin password:", err);
    process.exit(1);
  }
}

resetAdminPassword();

