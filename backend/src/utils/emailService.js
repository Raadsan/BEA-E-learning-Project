
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send an email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 */
export const sendNotification = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: `"BEA E-Learning" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        throw error;
    }
};

export const sendLoginOtp = async ({ to, name, otp, expiresInMinutes = 10 }) => {
    const frontendUrl = (process.env.FRONTEND_URL || "http://127.0.0.1:2004").replace(/\/$/, "");
    const logoUrl = `${frontendUrl}/images/headerlogo.png`;
    const displayName = name?.trim() || "there";

    const html = `
      <div style="background-color: #f4f6fb; padding: 32px 16px; font-family: Arial, Helvetica, sans-serif;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(1, 0, 128, 0.08);">
          <div style="background: #ffffff; padding: 32px 24px 28px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <img src="${logoUrl}" alt="BEA Logo" style="height: 88px; width: auto; max-width: 320px; display: block; margin: 0 auto;" />
          </div>
          <div style="padding: 32px 28px;">
            <p style="margin: 0 0 8px; color: #010080; font-size: 22px; font-weight: bold;">
              Hello, ${displayName}
            </p>
            <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
              Use the verification code below to complete your sign in to the BEA portal.
            </p>
            <div style="text-align: center; margin: 0 0 24px;">
              <div style="display: inline-block; background: #f0f4ff; border: 2px solid #010080; border-radius: 12px; padding: 18px 32px;">
                <span style="font-size: 34px; font-weight: bold; letter-spacing: 10px; color: #010080;">${otp}</span>
              </div>
            </div>
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; text-align: center;">
              This code expires in <strong>${expiresInMinutes} minutes</strong>.
            </p>
            <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.5; text-align: center;">
              If you did not try to sign in, you can safely ignore this email.
            </p>
          </div>
          <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 24px; text-align: center;">
            <p style="margin: 0; color: #010080; font-size: 12px; font-weight: bold;">Blue Print English Academy</p>
          </div>
        </div>
      </div>
    `;
    return sendNotification({
        to,
        subject: "Your BEA login verification code",
        html,
    });
};

export const sendTechnicalAdminCredentials = async ({ to, name, email, password }) => {
    const frontendUrl = (process.env.FRONTEND_URL || "http://127.0.0.1:2004").replace(/\/$/, "");
    const logoUrl = `${frontendUrl}/images/headerlogo.png`;
    const displayName = name?.trim() || "there";

    const html = `
      <div style="background-color: #f4f6fb; padding: 32px 16px; font-family: Arial, Helvetica, sans-serif;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
          <div style="background: #ffffff; padding: 32px 24px 28px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <img src="${logoUrl}" alt="BEA Logo" style="height: 88px; width: auto; max-width: 320px; display: block; margin: 0 auto;" />
          </div>
          <div style="padding: 32px 28px;">
            <p style="margin: 0 0 8px; color: #010080; font-size: 22px; font-weight: bold;">Hello, ${displayName}</p>
            <p style="margin: 0 0 20px; color: #4b5563; font-size: 15px; line-height: 1.6;">
              Your Technical Admin account has been created. Use the credentials below to sign in. You will receive an OTP by email each time you log in.
            </p>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Temporary Password:</strong> <span style="font-family: monospace; color: #010080;">${password}</span></p>
            </div>
            <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
              Please change your password after your first login if the option is available, and keep these details secure.
            </p>
          </div>
        </div>
      </div>
    `;

    return sendNotification({
        to,
        subject: "Your BEA Technical Admin account",
        html,
    });
};

export const sendProficiencyExamAccessGranted = async ({ to, name, hours = 24 }) => {
    const frontendUrl = (process.env.FRONTEND_URL || "http://127.0.0.1:2004").replace(/\/$/, "");
    const logoUrl = `${frontendUrl}/images/headerlogo.png`;
    const loginUrl = `${frontendUrl}/login`;
    const displayName = name?.trim() || "Student";

    const html = `
      <div style="background-color: #f4f6fb; padding: 32px 16px; font-family: Arial, Helvetica, sans-serif;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(1, 0, 128, 0.08);">
          <div style="background: #ffffff; padding: 32px 24px 28px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <img src="${logoUrl}" alt="BEA Logo" style="height: 88px; width: auto; max-width: 320px; display: block; margin: 0 auto;" />
          </div>
          <div style="padding: 32px 28px;">
            <p style="margin: 0 0 8px; color: #010080; font-size: 22px; font-weight: bold;">Hello, ${displayName}!</p>
            <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.6;">
              Your <strong>BEA English Proficiency Exam</strong> access has been granted by the administration.
            </p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 8px; color: #166534; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Authorized Window</p>
              <p style="margin: 0; color: #15803d; font-size: 28px; font-weight: 800;">${hours} Hours</p>
              <p style="margin: 6px 0 0; color: #166534; font-size: 13px;">You can now log in to your portal and take the test before your time expires.</p>
            </div>
            <div style="text-align: center; margin: 28px 0 16px;">
              <a href="${loginUrl}" style="display: inline-block; background-color: #010080; color: #ffffff; font-weight: bold; font-size: 15px; padding: 14px 32px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 12px rgba(1,0,128,0.25);">
                Log In & Take Exam
              </a>
            </div>
            <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.5; text-align: center;">
              If you have any questions or encounter any issues, please reach out to BEA Student Support.
            </p>
          </div>
          <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 24px; text-align: center;">
            <p style="margin: 0; color: #010080; font-size: 12px; font-weight: bold;">The Blueprint English Academy (BEA)</p>
          </div>
        </div>
      </div>
    `;

    return sendNotification({
        to,
        subject: `BEA Proficiency Exam Access Granted (${hours}h Window)`,
        html,
    });
};

export default { sendNotification, sendLoginOtp, sendTechnicalAdminCredentials, sendProficiencyExamAccessGranted };
