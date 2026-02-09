import * as Contact from "../models/contactModel.js";
import { sendNotification } from "../utils/emailService.js";

// CREATE CONTACT (Save to DB + Send Email)
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Save to database
    let contact;
    try {
      contact = await Contact.createContact({
        name,
        email,
        phone,
        message
      });
    } catch (dbErr) {
      console.error("❌ Database Error saving contact:", dbErr);
      return res.status(500).json({
        success: false,
        message: "Failed to save message to database"
      });
    }

    // Send email notification to admin
    let emailSent = false;
    let emailError = null;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const html = `
          <div style="font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #010080 0%, #1e1b4b 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">New Contact Inquiry</h1>
              <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px;">BEA E-Learning Portal</p>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px;">
              <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                Hello Administrator,<br>
                You have received a new message through the website contact form. Here are the details:
              </p>

              <!-- Details Table -->
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; width: 30%;">Name</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 15px; font-weight: 600;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Email</td>
                    <td style="padding: 8px 0; color: #010080; font-size: 15px; font-weight: 600;">
                      <a href="mailto:${email}" style="color: #010080; text-decoration: none;">${email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Phone</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 15px; font-weight: 600;">${phone || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 16px 0 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;" colspan="2">Message Content</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; color: #334155; font-size: 15px; line-height: 1.6; white-space: pre-wrap;" colspan="2">${message}</td>
                  </tr>
                </table>
              </div>

              <!-- Action Button -->
              <div style="text-align: center;">
                <a href="mailto:${email}" style="display: inline-block; background-color: #010080; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; transition: background-color 0.2s;">
                  Reply to ${name}
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} BEA (Blueprint English Academy). All rights reserved.<br>
                This is an automated notification from your learning portal.
              </p>
            </div>
          </div>
        `;

        await sendNotification({
          to: process.env.EMAIL_USER, // Send to site admin
          subject: `BEA Contact: ${name} - ${new Date().toLocaleDateString()}`,
          html: html
        });

        emailSent = true;
        console.log("✅ Contact email sent successfully to admin");
      } catch (err) {
        console.error("❌ Email failed to send:", err.message);
        emailError = err.message;
      }
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? "Message sent successfully! We'll get back to you soon."
        : "Message saved successfully, but email notification failed.",
      emailSent,
      emailError,
      contactId: contact.id
    });

  } catch (err) {
    console.error("❌ Controller Error:", err);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred"
    });
  }
};

// GET ALL CONTACTS
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.getAllContacts();
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET SINGLE CONTACT
export const getContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.getContactById(id);

    if (!contact) return res.status(404).json({ error: "Not found" });

    res.json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE CONTACT
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.deleteContactById(id);

    if (!deleted) return res.status(404).json({ error: "Not found" });

    res.json({ message: "Contact deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

