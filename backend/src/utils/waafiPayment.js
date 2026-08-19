const WAAFI_SUCCESS_CODES = new Set(["0000", "0", "2001", "200"]);

export const isWaafiPaymentSuccess = (response) => {
  if (!response) return false;
  
  const code = String(response.responseCode ?? response.code ?? response.errorCode ?? "").trim();
  if (WAAFI_SUCCESS_CODES.has(code)) return true;

  const msg = String(response.responseMsg ?? response.message ?? "").toUpperCase();
  if (msg.includes("SUCCESS") || msg.includes("APPROVED") || msg.includes("PROCESSED")) return true;

  const state = String(
    response.params?.state ?? 
    response.serviceParams?.status ?? 
    response.status ?? 
    ""
  ).toUpperCase();

  if (state === "APPROVED" || state === "SUCCESS" || state === "PAID") return true;

  return false;
};

export const getWaafiErrorMessage = (response) =>
  response?.responseMsg || response?.message || response?.params?.state || "Payment failed";

export const getWaafiTransactionId = (response, fallback) =>
  response?.params?.transactionId ||
  response?.serviceParams?.transactionId ||
  fallback;

export const sendWaafiPayment = async ({ transactionId, accountNo, amount, description }) => {
  // Trim credentials to avoid whitespace issues
  const merchantUid = (process.env.WAAFI_MERCHANT_UID || "").trim();
  const apiUserId = Number(process.env.WAAFI_API_USER_ID || "0");
  const apiKey = (process.env.WAAFI_API_KEY || "").trim();

  // Reverting to ISO string as it was working before
  const timestamp = new Date().toISOString();

  // Format amount to 2 decimal places (WaafiPay truncates > 2 decimals)
  const formattedAmount = Number(amount).toFixed(2);

  if (formattedAmount === "0.00") {
    return { responseCode: "9999", responseMsg: "Amount too low. Minimum amount is 0.01" };
  }

  // Ensure accountNo starts with 252 (remove + if present)
  if (!accountNo) {
    return { responseCode: "9999", responseMsg: "No account number provided" };
  }

  let cleanAccountNo = accountNo.toString().replace(/[^0-9]/g, '').trim();

  // If number starts with 061, convert to 25261
  if (cleanAccountNo.startsWith('061')) {
    cleanAccountNo = '252' + cleanAccountNo.substring(1);
  }

  if (!cleanAccountNo.startsWith('252')) {
    cleanAccountNo = '252' + cleanAccountNo;
  }

  const payload = {
    schemaVersion: "1.0",
    requestId: transactionId,
    timestamp: timestamp,
    channelName: "WEB",
    serviceName: "API_PURCHASE",
    merchantUid, // Root level often required
    apiUserId,   // Root level often required
    apiKey,      // Root level often required
    serviceParams: {
      merchantUid,
      apiUserId,
      apiKey,
      paymentMethod: "mwallet_account",
      payerInfo: {
        accountNo: cleanAccountNo
      },
      transactionInfo: {
        referenceId: transactionId,
        invoiceId: transactionId,
        amount: formattedAmount,
        currency: "USD",
        description: description
      }
    }
  };

  console.log("Sending WaafiPay Payload (SIMULATED):", JSON.stringify(payload, null, 2));

  try {

    // REAL API CALL
    const response = await fetch("https://api.waafipay.net/asm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    console.log("Waafi API Response:", JSON.stringify(data, null, 2));
    return data;

  } catch (err) {
    console.error("Waafi API Error:", err);
    return { responseCode: "9999", responseMsg: err.message || "Network error" };
  }
};
