// controllers/contactController.js
import * as Contact from "../models/contactModel.js";
import nodemailer from "nodemailer";

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

    // Save to database first
    const contact = await Contact.createContact({
      name,
      email,
      phone,
      message
    });

    // Send email (if configured) - Non-blocking, won't affect database save
    let emailSent = false;
    let emailError = null;

    // Try to send email, but don't let it block the response
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        // Clean email password (remove spaces that might be in .env file)
        const emailPass = String(process.env.EMAIL_PASS).trim().replace(/\s+/g, '');
        
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER.trim(),
            pass: emailPass,
          },
        });

        // Don't verify - just try to send (verify can fail even with correct credentials)
        const mailOptions = {
          from: `"${name}" <${process.env.EMAIL_USER}>`,
          replyTo: email,
          to: process.env.EMAIL_USER, // You receive the message
          subject: `New Contact Message from ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #010080; border-bottom: 2px solid #010080; padding-bottom: 10px;">
                New Contact Form Message
              </h2>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                ${phone ? `<p style="margin: 10px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
                <p style="margin: 10px 0;"><strong>Message:</strong></p>
                <p style="margin: 10px 0; padding: 10px; background-color: white; border-left: 3px solid #010080;">
                  ${message.replace(/\n/g, '<br>')}
                </p>
              </div>
              <p style="margin-top: 20px; color: #666; font-size: 12px;">
                This message was sent from the BEA E-learning contact form.
              </p>
            </div>
          `,
          text: `
            New Contact Form Message
            
            Name: ${name}
            Email: ${email}
            ${phone ? `Phone: ${phone}` : ''}
            Message: ${message}
          `,
        };

        // Try to send email (without verify step)
        const info = await transporter.sendMail(mailOptions);
        emailSent = true;
        console.log("✅ Email sent successfully:", info.messageId);
      } catch (emailErr) {
        emailError = emailErr.code === 'EAUTH' 
          ? "Email authentication failed. Please check your EMAIL_USER and EMAIL_PASS in .env file. Make sure EMAIL_PASS is a Gmail App Password (16 characters, no spaces)."
          : emailErr.message || "Email failed to send";
        console.error("❌ Email Error:", emailErr);
        console.error("❌ Email Error Details:", {
          code: emailErr.code,
          command: emailErr.command,
          response: emailErr.response
        });
        // Continue - contact is already saved in DB
      }
    } else {
      console.log("ℹ️ Email not configured - skipping email send");
    }

    // Return success - contact is saved even if email fails
    res.status(201).json({ 
      success: true, 
      message: "Contact saved successfully" + (emailSent ? " and email sent!" : (emailError ? " (email failed but contact saved)" : " (email not configured)")),
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone
      },
      emailSent,
      emailError: emailError || undefined
    });

  } catch (err) {
    console.error("❌ Contact Save Error:", err);
    console.error("❌ Error Stack:", err.stack);
    res.status(500).json({ 
      success: false, 
      message: "Failed to save contact: " + (err.message || "Unknown error"),
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
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

