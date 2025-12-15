// utils/encryption.js
import crypto from 'crypto';

// Encryption key - should be in .env file for production
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!!'; // 32 characters
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

// Encrypt password
export const encryptPassword = (password) => {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw error;
  }
};

// Decrypt password
export const decryptPassword = (encryptedPassword) => {
  try {
    if (!encryptedPassword || !encryptedPassword.includes(':')) {
      // If not encrypted format, return as is (for backward compatibility)
      return encryptedPassword;
    }
    const parts = encryptedPassword.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = parts.join(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('❌ Decryption error:', error);
    // If decryption fails, return the encrypted value (might be old format)
    return encryptedPassword;
  }
};



