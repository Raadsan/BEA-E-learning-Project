import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'payments');
const LOG_FILE = path.join(LOG_DIR, 'payments.log.json');

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
    if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '[]', 'utf-8');
  } catch (e) {
    console.error('Failed to ensure payments log directory', e);
  }
}

function writeLog(entry) {
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

export const createEvcPayment = (req, res) => {
  const { student, programId, amount, accountNumber } = req.body || {};
  if (!student || !programId || !amount || !accountNumber) {
    return res.status(400).json({ error: 'Missing payment data' });
  }

  // Simulate contacting EVC/Waafi provider and returning a transaction id
  const transactionId = `EVC-${Date.now()}`;

  const entry = { id: transactionId, method: 'evc', studentEmail: student.email, programId, amount, accountNumber, status: 'paid', createdAt: new Date().toISOString() };
  writeLog(entry);

  // Return success - in real integration you would call the provider's API here
  res.json({ success: true, transactionId });
};

export { writeLog };

export const createBankPayment = (req, res) => {
  const { student, programId, amount, accountNumber } = req.body || {};
  if (!student || !programId || !amount) {
    return res.status(400).json({ error: 'Missing payment data' });
  }

  const transactionId = `BANK-${Date.now()}`;
  const entry = { id: transactionId, method: 'bank', studentEmail: student.email, programId, amount, accountNumber: accountNumber || null, status: 'pending', createdAt: new Date().toISOString() };
  writeLog(entry);

  // Bank transfers are usually manual; we mark as pending
  res.json({ success: true, transactionId });
};

export const createWaafiPayment = async (req, res) => {
  const { payerPhone, amount, currency = 'USD', programId, description } = req.body || {};
  console.log('[Waafi] incoming request body ->', req.body);
  if (!payerPhone || !amount || !programId) {
    console.warn('[Waafi] Missing required fields', { payerPhone, amount, programId });
    return res.status(400).json({ error: 'Missing waafi payment data (payerPhone, amount, programId required)' });
  }

  try {
    // Build payload expected by Waafi (using provided schema)
    const payload = {
      schemaVersion: '1.0',
      requestId: String(Date.now()),
      timestamp: new Date().toISOString(),
      channelName: 'WEB',
      serviceName: 'API_PURCHASE',
      serviceParams: {
        merchantUid: process.env.WAAFI_MERCHANT_UID || 'M0910291',
        apiUserId: process.env.WAAFI_API_USER_ID || '1000416',
        apiKey: process.env.WAAFI_API_KEY || 'API-675418888AHX',
        paymentMethod: 'mwallet_account',
        payerInfo: {
          accountNo: payerPhone
        },
        transactionInfo: {
          referenceId: `REF-${Date.now()}`,
          invoiceId: `INV-${Date.now()}`,
          amount: amount,
          currency: currency,
          description: description || 'Application fee'
        }
      }
    };

    const WAAPI = process.env.WAAFI_ENDPOINT || 'https://api.waafipay.net/asm';
    console.log('[Waafi] sending to WAAPI ->', WAAPI, payload);

    // POST to Waafi
    const resp = await fetch(WAAPI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await resp.json().catch(() => ({}));
    console.log('[Waafi] response status ->', resp.status, 'body ->', json);

    // For logging
    const transactionId = json?.transactionId || `WAAFI-${Date.now()}`;

    const entry = { id: transactionId, method: 'waafi', payerPhone, programId, amount, response: json, createdAt: new Date().toISOString() };
    writeLog(entry);

    // Interpret Waafi response codes and decide next action
    const respCode = json?.responseCode || json?.code || null;
    const respMsg = json?.responseMsg || json?.message || null;

    // If response indicates insufficient balance (e.g., 5206/E10205), return a clear error
    if (respCode === '5206' || json?.errorCode === 'E10205' || (typeof respMsg === 'string' && /insufficient|haraaga/i.test(respMsg))) {
      return res.status(400).json({ success: false, error: respMsg || 'Insufficient balance' , raw: json });
    }

    // If provider indicates a PIN/OTP step is required, signal frontend to ask for PIN
    const needsPin = json?.requiresPin || json?.challenge || (respCode && respCode.toString().startsWith('1')) || (json?.status && json.status.toLowerCase() === 'pending');
    if (needsPin) {
      return res.json({ success: true, requiresPin: true, transactionId, raw: json });
    }

    // Otherwise consider success only if provider signals success
    const success = (respCode && (respCode === '0000' || respCode === '0')) || (json?.status && ['success','ok'].includes(json.status.toLowerCase()));

    if (!success) {
      return res.status(400).json({ success: false, error: respMsg || 'Payment failed', raw: json });
    }

    // Successful immediate payment
    res.json({ success: true, transactionId, raw: json });
  } catch (err) {
    console.error('Waafi error', err);
    res.status(500).json({ success: false, error: err.message || 'Waafi request failed' });
  }
};