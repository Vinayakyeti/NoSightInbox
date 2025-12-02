const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const mailRoutes = require('./routes/mailRoutes');
const { verifyGmailConnection } = require('./config/emailConfig');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nosightinbox', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NoSightInbox API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/mail', mailRoutes);

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 NoSightInbox server running on port ${PORT}`);
  console.log(`📧 API available at http://localhost:${PORT}/api`);
  
  if (process.env.ENABLE_REAL_EMAIL === 'true') {
    console.log('📬 Checking Gmail SMTP connection...');
    await verifyGmailConnection();
  } else {
    console.log('📭 Gmail integration disabled (set ENABLE_REAL_EMAIL=true to enable)');
  }
});
