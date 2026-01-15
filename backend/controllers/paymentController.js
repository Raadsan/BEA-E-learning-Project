import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { updateStudentById, getStudentByEmail } from '../models/studentModel.js';
import { getPaymentPackageById } from '../models/paymentPackageModel.js';
import { sendWaafiPayment } from '../utils/waafiPayment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, '../logs');
const LOG_FILE = path.join(LOG_DIR, 'payments.json');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '[]', 'utf-8');
}

export function writeLog(entry) {
  try {
    ensureLogDir();
    const raw = fs.readFileSync(LOG_FILE, 'utf-8');
    const arr = JSON.parse(raw || '[]');
    arr.push(entry);
    fs.writeFileSync(LOG_FILE, JSON.stringify(arr, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write payment log', e);
  }
}

// Helper to extend subscription
async function extendSubscription(studentEmail, packageId) {
  try {
    const student = await getStudentByEmail(studentEmail);
    const pkg = await getPaymentPackageById(packageId);

    if (!student || !pkg) return false;

    const durationMonths = parseInt(pkg.duration_months) || 1;
    let currentPaidUntil = student.paid_until ? new Date(student.paid_until) : new Date();

    // If student is already expired, start from now. Otherwise, extend from current expiry.
    const baseDate = currentPaidUntil > new Date() ? currentPaidUntil : new Date();
    const newPaidUntil = new Date(baseDate.setMonth(baseDate.getMonth() + durationMonths));

    await updateStudentById(student.student_id, {
      paid_until: newPaidUntil.toISOString().slice(0, 19).replace('T', ' '),
      funding_status: 'Paid',
      funding_amount: pkg.amount,
      funding_month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    });

    return true;
  } catch (err) {
    console.error('Failed to extend subscription:', err);
    return false;
  }
}

export const createEvcPayment = async (req, res) => {
  const { student, programId, amount, accountNumber } = req.body || {};
  if (!student || !amount) return res.status(400).json({ success: false, error: 'Missing data' });

  // Simulate success
  const transactionId = `EVC-${Date.now()}`;
  const entry = { id: transactionId, method: 'evc', studentEmail: student.email, programId, amount, accountNumber, status: 'paid', createdAt: new Date().toISOString() };
  writeLog(entry);

  // Extend subscription
  await extendSubscription(student.email, programId);

  res.json({ success: true, transactionId });
};

export const createBankPayment = (req, res) => {
  const { student, programId, amount, accountNumber } = req.body || {};
  if (!student || !amount) return res.status(400).json({ success: false, error: 'Missing data' });

  const transactionId = `BANK-${Date.now()}`;
  const entry = { id: transactionId, method: 'bank', studentEmail: student.email, programId, amount, accountNumber: accountNumber || null, status: 'pending', createdAt: new Date().toISOString() };
  writeLog(entry);

  // Note: We DO NOT extend subscription for Bank transfers until an admin confirms it.
  res.json({ success: true, transactionId, message: 'Transfer recorded. Pending verification.' });
};

export const createWaafiPayment = async (req, res) => {
  const { payerPhone, amount, currency = 'USD', programId, description, studentEmail } = req.body || {};
  console.log('[Waafi] incoming payment request ->', req.body);

  if (!payerPhone || !amount) return res.status(400).json({ success: false, error: 'Missing payerPhone or amount' });

  try {
    const transactionId = `WAAFI-${Date.now()}`;

    // Call centralized utility
    const json = await sendWaafiPayment({
      transactionId,
      accountNo: payerPhone,
      amount,
      description: description || 'BEA Payment'
    });

    console.log('[Waafi] response body ->', json);

    writeLog({ id: transactionId, method: 'waafi', payerPhone, programId, amount, response: json, createdAt: new Date().toISOString() });

    // Interpret Waafi response codes
    const respCode = json?.responseCode || json?.code || null;
    const respMsg = json?.responseMsg || json?.message || null;

    // Error handling
    if (respCode === '5206' || json?.errorCode === 'E10205' || (typeof respMsg === 'string' && /insufficient|haraaga/i.test(respMsg))) {
      return res.status(400).json({ success: false, error: respMsg || 'Insufficient balance', raw: json });
    }

    // Success check (Waafi uses 2001 for success in some versions, or 0000)
    const success = (respCode === '0000' || respCode === '0' || respCode === '2001') ||
      (json?.status && ['success', 'ok', 'paid'].includes(json.status.toLowerCase()));

    if (!success) {
      // Check if PIN is required
      const needsPin = json?.requiresPin || json?.challenge || (respCode && respCode.toString().startsWith('1')) || (json?.status && json.status.toLowerCase() === 'pending');
      if (needsPin) {
        return res.json({ success: true, requiresPin: true, transactionId, raw: json });
      }
      return res.status(400).json({ success: false, error: respMsg || 'Payment failed', raw: json });
    }

    // Successful immediate payment
    if (studentEmail) {
      await extendSubscription(studentEmail, programId);
    }
    res.json({ success: true, transactionId, raw: json });
  } catch (err) {
    console.error('Waafi error', err);
    res.status(500).json({ success: false, error: err.message || 'Waafi request failed' });
  }
};
