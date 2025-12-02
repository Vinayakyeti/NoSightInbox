const express = require('express');
const Email = require('../models/Email');
const authMiddleware = require('../middleware/auth');
const { sendGmailEmail } = require('../config/emailConfig');

const router = express.Router();

router.use(authMiddleware);

router.post('/send', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    const from = req.user.username;
    if (!to || !subject || !body) {
      return res.status(400).json({ 
        error: 'Recipient, subject, and body are required' 
      });
    }
    
    const isRealEmail = to.includes('@');
    const enableRealEmail = process.env.ENABLE_REAL_EMAIL === 'true';
    
    if (isRealEmail && enableRealEmail) {
      console.log(`📧 Sending real email to ${to}...`);
      const emailResult = await sendGmailEmail(from, to, subject, body);
      
      if (!emailResult.success) {
        console.error('Gmail send failed:', emailResult.error);
      } else {
        console.log(`✅ Email sent to ${to} via Gmail`);
      }
    }
    
    if (!isRealEmail) {
      const inboxEmail = new Email({
        from,
        to: to.toLowerCase(),
        subject,
        body,
        status: 'inbox'
      });
      await inboxEmail.save();
    }
    
    const sentEmail = new Email({
      from,
      to: to.toLowerCase(),
      subject,
      body,
      status: 'sent'
    });
    await sentEmail.save();
    
    res.status(201).json({
      message: isRealEmail && enableRealEmail 
        ? 'Email sent to Gmail successfully' 
        : 'Email sent successfully',
      email: {
        id: sentEmail._id,
        to: sentEmail.to,
        subject: sentEmail.subject,
        sentAt: sentEmail.sentAt,
        sentToGmail: isRealEmail && enableRealEmail
      }
    });
    
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ 
      error: 'Failed to send email. Please try again.' 
    });
  }
});

router.get('/inbox', async (req, res) => {
  try {
    const username = req.user.username;
    const emails = await Email.getInbox(username);
    
    res.json({
      count: emails.length,
      emails: emails.map(email => ({
        id: email._id,
        from: email.from,
        subject: email.subject,
        body: email.body,
        isRead: email.isRead,
        sentAt: email.sentAt
      }))
    });
    
  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve inbox. Please try again.' 
    });
  }
});

router.get('/sent', async (req, res) => {
  try {
    const username = req.user.username;
    const emails = await Email.getSent(username);
    
    // Send response
    res.json({
      count: emails.length,
      emails: emails.map(email => ({
        id: email._id,
        to: email.to,
        subject: email.subject,
        body: email.body,
        sentAt: email.sentAt
      }))
    });
    
  } catch (error) {
    console.error('Get sent emails error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve sent emails. Please try again.' 
    });
  }
});

router.get('/trash', async (req, res) => {
  try {
    const username = req.user.username;
    const emails = await Email.getTrash(username);
    
    // Send response
    res.json({
      count: emails.length,
      emails: emails.map(email => ({
        id: email._id,
        from: email.from,
        to: email.to,
        subject: email.subject,
        body: email.body,
        trashedAt: email.trashedAt,
        sentAt: email.sentAt
      }))
    });
    
  } catch (error) {
    console.error('Get trash error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve trash. Please try again.' 
    });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user.username;
    const email = await Email.findOne({ _id: id, to: username });
    
    if (!email) {
      return res.status(404).json({ 
        error: 'Email not found' 
      });
    }
    
    email.isRead = true;
    await email.save();
    
    // Send response
    res.json({
      message: 'Email marked as read',
      email: {
        id: email._id,
        isRead: email.isRead
      }
    });
    
  } catch (error) {
    console.error('Mark email as read error:', error);
    res.status(500).json({ 
      error: 'Failed to update email. Please try again.' 
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user.username;
    const email = await Email.findOne({ 
      _id: id, 
      $or: [{ to: username }, { from: username }]
    });
    
    if (!email) {
      return res.status(404).json({ 
        error: 'Email not found' 
      });
    }
    
    email.status = 'trash';
    email.trashedAt = new Date();
    await email.save();
    
    res.json({
      message: 'Email moved to trash',
      email: {
        id: email._id,
        status: email.status
      }
    });
    
  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({ 
      error: 'Failed to delete email. Please try again.' 
    });
  }
});

module.exports = router;
