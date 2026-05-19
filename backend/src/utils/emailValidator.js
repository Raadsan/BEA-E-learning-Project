import { validate } from 'deep-email-validator';

export const validateEmailRobust = async (emailStr) => {
    // Basic formatting & disposable check
    const basicCheck = await validate({
        email: emailStr,
        validateRegex: true,
        validateMx: false,
        validateTypo: true,
        validateDisposable: true,
        validateSMTP: false
    });

    if (!basicCheck.valid && basicCheck.reason !== 'mx' && basicCheck.reason !== 'smtp') {
        return { valid: false, message: "Invalid email format or disposable email detected." };
    }

    // External API Check (if configured in .env)
    const apiUrl = process.env.EMAIL_VALIDATION_API_URL;
    const apiKey = process.env.EMAIL_VALIDATION_API_KEY;

    if (apiUrl && apiKey) {
        try {
            // Example: Using Abstract API or similar
            // URL format in .env: https://emailvalidation.abstractapi.com/v1/?api_key=YOUR_KEY&email=
            const response = await fetch(`${apiUrl}${apiKey}&email=${emailStr}`);
            if (response.ok) {
                const data = await response.json();
                
                // Check both old and new Abstract API structures, as well as Hunter.io
                const isUndeliverable = 
                    data.deliverability === "UNDELIVERABLE" || 
                    data.deliverability === "undeliverable" ||
                    data.email_deliverability?.status === "undeliverable" ||
                    data.is_valid_format?.value === false ||
                    data.email_deliverability?.is_format_valid === false;

                if (isUndeliverable) {
                    return { valid: false, message: "Invalid email address. Please provide a real and working email." };
                }
            }
        } catch (error) {
            console.error("External email validation API failed:", error.message);
            // Fallback to basic check if API is down
        }
    }

    return { valid: true };
};
