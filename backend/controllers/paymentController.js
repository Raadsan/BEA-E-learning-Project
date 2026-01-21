import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { updateStudentById, getStudentByEmail } from '../models/studentModel.js';
import { getPaymentPackageById } from '../models/paymentPackageModel.js';
import { sendWaafiPayment } from '../utils/waafiPayment.js';
import { createPayment } from '../models/paymentModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = path.join(__dirname, '../logs/payments.json');
const DEBUG_FILE = path.join(__dirname, '../payment_debug.log');

function logDebug(msg) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${msg}\n`;
  try {
    fs.appendFileSync(DEBUG_FILE, entry);
  } catch (e) {
    console.error('Failed to write debug log', e);
  }
}

function ensureLogDir() {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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
  logDebug(`Extending subscription for ${studentEmail}, package ${packageId}`);
  try {
    const student = await getStudentByEmail(studentEmail);
    const pkg = await getPaymentPackageById(packageId);

    if (!student) {
      logDebug(`ERROR: Student not found for email ${studentEmail}`);
      return false;
    }
    if (!pkg) {
      logDebug(`ERROR: Package not found for ID ${packageId}`);
      return false;
    }

    const durationMonths = parseInt(pkg.duration_months) || 1;
    let currentPaidUntil = student.paid_until ? new Date(student.paid_until) : new Date();
    const baseDate = currentPaidUntil > new Date() ? currentPaidUntil : new Date();
    const newPaidUntil = new Date(baseDate.setMonth(baseDate.getMonth() + durationMonths));

    const result = await updateStudentById(student.student_id, {
      paid_until: newPaidUntil.toISOString().slice(0, 19).replace('T', ' '),
      funding_status: 'Paid',
      funding_amount: pkg.amount,
      funding_month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    });

    logDebug(`Subscription extended successfully for ${studentEmail}. Rows affected: ${result}`);
    return true;
  } catch (err) {
    logDebug(`CRITICAL ERROR in extendSubscription: ${err.message}`);
    console.error('Failed to extend subscription:', err);
    return false;
  }
}

export const createEvcPayment = async (req, res) => {
  const { student, programId, amount, accountNumber } = req.body || {};
  logDebug(`Incoming EVC Request for ${student?.email}, amount ${amount}`);

  if (!student || !amount) return res.status(400).json({ success: false, error: 'Missing data' });

  const transactionId = `EVC-${Date.now()}`;

  // 1. Log to JSON
  writeLog({ id: transactionId, method: 'evc', studentEmail: student.email, programId, amount, accountNumber, status: 'paid', createdAt: new Date().toISOString() });

  // 2. Log to Database
  try {
    const studentData = await getStudentByEmail(student.email);
    if (studentData) {
      await createPayment({
        student_id: studentData.student_id,
        method: 'evc',
        provider_transaction_id: transactionId,
        amount: amount,
        status: 'paid',
        payer_phone: accountNumber,
        program_id: programId
      });
    }
  } catch (err) {
    logDebug(`EVC DB Log Error: ${err.message}`);
  }

  // 3. Extend subscription (non-blocking)
  extendSubscription(student.email, programId).catch(e => logDebug(`EVC Extension Error: ${e.message}`));

  res.json({ success: true, transactionId });
};

export const createBankPayment = async (req, res) => {
  const { student, programId, amount, accountNumber } = req.body || {};
  logDebug(`Incoming Bank Payment for ${student?.email}, amount ${amount}`);

  if (!student || !amount) return res.status(400).json({ success: false, error: 'Missing data' });

  const transactionId = `BANK-${Date.now()}`;

  // 1. Log to JSON
  writeLog({ id: transactionId, method: 'bank', studentEmail: student.email, programId, amount, accountNumber: accountNumber || null, status: 'pending', createdAt: new Date().toISOString() });

  // 2. Log to Database
  try {
    const studentData = await getStudentByEmail(student.email);
    if (studentData) {
      await createPayment({
        student_id: studentData.student_id,
        method: 'bank',
        provider_transaction_id: transactionId,
        amount: amount,
        status: 'pending', // Pending admin verification
        payer_phone: accountNumber,
        program_id: programId
      });
    }
  } catch (err) {
    logDebug(`Bank DB Log Error: ${err.message}`);
  }

  res.json({ success: true, transactionId, message: 'Transfer recorded. Pending verification.' });
};

export const createWaafiPayment = async (req, res) => {
  logDebug(`Incoming Waafi Request Body: ${JSON.stringify(req.body)}`);

  const { payerPhone, amount, currency = 'USD', programId, description, studentEmail } = req.body || {};

  if (!payerPhone || !amount) {
    logDebug('Validation failed: Missing payerPhone or amount');
    return res.status(400).json({ success: false, error: 'Missing payerPhone or amount' });
  }

  try {
    const transactionId = `WAAFI-${Date.now()}`;
    logDebug(`Generated transactionId: ${transactionId}`);

    // Parallelize Waafi API call and Student lookup
    const [json, student] = await Promise.all([
      sendWaafiPayment({
        transactionId,
        accountNo: payerPhone,
        amount,
        description: description || 'BEA Payment'
      }),
      studentEmail ? getStudentByEmail(studentEmail) : Promise.resolve(null)
    ]);

    logDebug(`Waafi response: ${JSON.stringify(json)}`);

    const respCode = String(json?.responseCode || json?.code || "");
    const respMsg = json?.responseMsg || json?.message || "Payment failed";
    const isSuccess = (respCode === '0000' || respCode === '0' || respCode === '2001' || respCode === '200') ||
      (json?.status && ['success', 'ok', 'paid'].includes(json.status.toLowerCase()));

    // Record in background (don't await)
    const recordPayment = async () => {
      // JSON Log
      writeLog({ id: transactionId, method: 'waafi', payerPhone, programId, amount, studentEmail, response: json, createdAt: new Date().toISOString() });

      // DB Log
      if (student) {
        try {
          await createPayment({
            student_id: student.student_id,
            method: 'waafi',
            provider_transaction_id: json?.serviceParams?.transactionId || transactionId,
            amount: amount,
            status: isSuccess ? 'paid' : 'failed',
            raw_response: json,
            payer_phone: payerPhone,
            program_id: programId
          });
        } catch (err) {
          logDebug(`DB Log Error: ${err.message}`);
        }
      }
    };
    recordPayment(); // Fire and forget

    if (!isSuccess) {
      logDebug(`Payment not successful. Code: ${respCode}, Msg: ${respMsg}`);
      const needsPin = json?.requiresPin || json?.challenge || respCode.startsWith('1') || (json?.status && json.status.toLowerCase() === 'pending');
      if (needsPin) {
        logDebug('PIN required');
        return res.json({ success: true, requiresPin: true, transactionId, raw: json });
      }
      return res.status(400).json({ success: false, error: respMsg, raw: json });
    }

    logDebug('Payment successful. Returning success immediately.');
    res.json({ success: true, transactionId, raw: json });

    // Background extension
    if (studentEmail) {
      extendSubscription(studentEmail, programId).catch(e => logDebug(`Extension Error: ${e.message}`));
    }
  } catch (err) {
    logDebug(`CRITICAL ERROR in createWaafiPayment: ${err.message}\n${err.stack}`);
    console.error('Waafi error', err);
    res.status(500).json({ success: false, error: err.message || 'Waafi request failed' });
  }
};
