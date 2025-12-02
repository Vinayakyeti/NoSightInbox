// ============================================
// Email Configuration for Gmail Integration
// Using Nodemailer with Gmail SMTP
// ============================================

const nodemailer = require('nodemailer');

// ============================================
// Create Gmail Transporter
// ============================================

const createTransporter = () => {
  // Gmail SMTP configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,     // Your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD  // Gmail App Password (not regular password)
    }
  });

  return transporter;
};

// ============================================
// Send Email via Gmail
// ============================================

const sendGmailEmail = async (from, to, subject, body) => {
  try {
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
      from: `NoSightInbox <${process.env.GMAIL_USER}>`,
      to: to,
      subject: subject,
      text: body,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #667eea;">NoSightInbox Email</h2>
          <p><strong>From:</strong> ${from}</p>
          <hr style="border: 1px solid #eee;">
          <div style="margin-top: 20px;">
            ${body.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: 1px solid #eee; margin-top: 30px;">
          <p style="color: #999; font-size: 12px;">
            Sent via NoSightInbox - Accessible Email System for Visually Impaired Users
          </p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============================================
// Verify Gmail Connection
// ============================================

const verifyGmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ Gmail SMTP connection failed:', error.message);
    return false;
  }
};

module.exports = {
  sendGmailEmail,
  verifyGmailConnection
};
