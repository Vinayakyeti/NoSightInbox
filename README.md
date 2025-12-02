# NoSightInbox 📧🎤

**A web-based IVR (Interactive Voice Response) Email System for visually impaired users**

NoSightInbox is a MERN stack prototype that enables users to manage their emails using **voice commands** and **mouse click patterns** — no text input required! The system focuses on accessibility, simplicity, and ease of use.

---

## 🎯 Core Features

### 1. **Pattern-Based Login**
- **Username:** Enter via voice input (Speech-to-Text)
- **Password:** Create a unique click pattern sequence:
  - `L` = Left click
  - `R` = Right click
  - `DL` = Double left click
  - `DR` = Double right click
  - `LL` = Long left click (hold for 700ms)
- Example pattern: `L-R-DL-LL-R`
- Pattern is securely hashed and stored in MongoDB

### 2. **Voice-Guided Dashboard**
- Navigate your mailbox using mouse clicks:
  - **Left Click** → Compose Mail
  - **Right Click** → Sent Mail
  - **Double Left Click** → Inbox
  - **Double Right Click** → Logout
  - **Long Left Click** → Trash
- Voice feedback announces each action

### 3. **Compose Mail with Voice**
- Use Speech-to-Text for:
  - Recipient username
  - Email subject
  - Email body
- Send emails with a button click
- Emails saved to MongoDB (inbox, sent, trash)

### 4. **Email Management**
- **Inbox:** View received emails, hear them read aloud
- **Sent Mail:** Review sent messages
- **Trash:** Access deleted emails
- Mark emails as read/unread
- Voice announcements for all actions

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, React Router, Bootstrap, Web Speech API |
| **Backend** | Node.js, Express.js, JWT Authentication |
| **Database** | MongoDB, Mongoose |
| **Voice** | Browser Web Speech API (SpeechRecognition, SpeechSynthesis) |
| **Security** | bcryptjs (password hashing), JWT (tokens) |

---

## 📁 Project Structure

```
no-sight/
├── server/                    # Backend (Express + MongoDB)
│   ├── models/
│   │   ├── User.js           # User schema with click pattern
│   │   └── Email.js          # Email schema (inbox, sent, trash)
│   ├── routes/
│   │   ├── authRoutes.js     # /register, /login
│   │   └── mailRoutes.js     # /send, /inbox, /sent, /trash
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── server.js             # Main Express server
│   ├── package.json          # Backend dependencies
│   └── .env.example          # Environment variables template
│
├── src/                       # Frontend (React)
│   ├── components/
│   │   ├── Login.jsx         # Login with voice + click pattern
│   │   ├── Register.jsx      # User registration
│   │   ├── Dashboard.jsx     # Main navigation hub
│   │   ├── ComposeMail.jsx   # Voice-based email composition
│   │   ├── Inbox.jsx         # View received emails
│   │   ├── SentMail.jsx      # View sent emails
│   │   └── Trash.jsx         # View deleted emails
│   ├── context/
│   │   └── AuthContext.jsx   # Authentication state management
│   ├── utils/
│   │   ├── voiceUtils.js     # Speech-to-Text & Text-to-Speech
│   │   └── clickPattern.js   # Click pattern detection hook
│   ├── App.jsx               # Main app with routing
│   ├── App.css               # Global styles
│   └── main.jsx              # React entry point
│
├── package.json               # Frontend dependencies
├── index.html                 # HTML template
└── README.md                  # This file
```

---

## 🚀 Setup Instructions

### Prerequisites

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (local or Atlas) - [Download](https://www.mongodb.com/try/download/community)
3. **Modern Browser** (Chrome, Edge, Safari) with Web Speech API support

---

### Backend Setup

1. **Navigate to server directory:**
   ```powershell
   cd server
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Create `.env` file:**
   ```powershell
   copy .env.example .env
   ```

4. **Edit `.env` with your values:**
   ```env
   MONGO_URI=mongodb://localhost:27017/nosightinbox
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

5. **Start MongoDB** (if running locally):
   ```powershell
   mongod
   ```

6. **Start the backend server:**
   ```powershell
   npm run dev
   ```

   Server will run at: `http://localhost:5000`

---

### Frontend Setup

1. **Navigate to root directory:**
   ```powershell
   cd ..
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start the React development server:**
   ```powershell
   npm run dev
   ```

   Frontend will run at: `http://localhost:5173`

---

## 🎮 Usage Guide

### 1. **Register a New Account**

1. Open `http://localhost:5173` in your browser
2. Click **"New User? Register Here"**
3. Click the **🎤 Speak** button and say your username
4. (Optional) Enter your email address
5. Create a click pattern password:
   - Click anywhere on the screen with different patterns
   - Minimum 3 clicks required
   - Example: Left → Right → Double Left → Long Left
6. Click **"Register"**

### 2. **Login**

1. Click **🎤 Speak** and say your username
2. Enter your click pattern (same sequence as registration)
3. Click **"Login"**
4. You'll be redirected to the Dashboard

### 3. **Dashboard Navigation**

Listen to the voice instructions, then use mouse clicks:

- **Left Click** → Compose a new email
- **Right Click** → View sent emails
- **Double Left Click** → View inbox
- **Double Right Click** → Logout
- **Long Left Click** → View trash

### 4. **Compose an Email**

1. Navigate to Compose (left click on dashboard)
2. Click **🎤 Speak** next to **"To"** field and say recipient's username
3. Click **🎤 Speak** next to **"Subject"** field and say the subject
4. Click **🎤 Speak** next to **"Message"** field and say your message
5. Click **"📧 Send Email"**

### 5. **View Inbox**

1. Navigate to Inbox (double left click on dashboard)
2. Click on any email to hear it read aloud
3. Email will be marked as read automatically
4. Click **"🗑️ Delete"** to move to trash

---

## 🔧 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login with username + click pattern |

### Mail Operations (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/mail/send` | Send new email |
| `GET` | `/api/mail/inbox` | Get inbox emails |
| `GET` | `/api/mail/sent` | Get sent emails |
| `GET` | `/api/mail/trash` | Get trash emails |
| `PATCH` | `/api/mail/:id/read` | Mark email as read |
| `DELETE` | `/api/mail/:id` | Move email to trash |

---

## 🎨 Accessibility Features

✅ **High Contrast UI** - Large fonts, bold colors  
✅ **Voice Feedback** - Every action is announced  
✅ **Keyboard Navigation** - Focus indicators for accessibility  
✅ **No Text Input Required** - Fully voice-driven  
✅ **Simple Click Patterns** - Easy to remember passwords  
✅ **Screen Reader Friendly** - Semantic HTML structure  

---

## 🧪 Testing

### Test User Registration

1. **Username:** "testuser" (say via voice)
2. **Click Pattern:** Left → Right → Left (minimum 3 clicks)
3. Register and login with same pattern

### Test Email Flow

1. Register two users: "alice" and "bob"
2. Login as "alice"
3. Compose email to "bob"
4. Logout and login as "bob"
5. Check inbox for alice's email
6. Email should be read aloud when clicked

---

## 🛠️ Troubleshooting

### Browser Speech API Not Working

- **Chrome/Edge:** May require HTTPS in production (works on localhost)
- **Firefox:** Check `about:config` → `media.webspeech.recognition.enable`
- **Safari:** Limited support, use Chrome/Edge for best experience

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Ensure MongoDB is running:
```powershell
mongod --dbpath C:\path\to\your\data
```

### CORS Errors

Ensure backend `.env` has correct `CLIENT_URL`:
```
CLIENT_URL=http://localhost:5173
```

### Voice Input Not Capturing

- **Check microphone permissions** in browser settings
- **Speak clearly** and wait for "Listening..." indicator
- **Try shorter phrases** (1-2 seconds)

---

## 🔐 Security Notes

⚠️ **This is a prototype for educational purposes**

For production use:
- Use stronger JWT secrets (32+ random characters)
- Enable HTTPS for speech API
- Add rate limiting to prevent abuse
- Implement email validation
- Add CAPTCHA to registration
- Use environment-specific configs

---

## 📚 Browser Compatibility

| Browser | Speech Recognition | Speech Synthesis |
|---------|-------------------|------------------|
| Chrome 25+ | ✅ Yes | ✅ Yes |
| Edge 79+ | ✅ Yes | ✅ Yes |
| Safari 14.1+ | ⚠️ Limited | ✅ Yes |
| Firefox | ❌ No (needs flag) | ✅ Yes |

**Recommended:** Chrome or Edge for full functionality

---

## 🤝 Contributing

This is an educational prototype. Feel free to fork and enhance:

- Add voice commands ("Open Inbox", "Go Back")
- Implement NLP for better voice understanding
- Add email search functionality
- Support attachments
- Add notifications

---

## 📄 License

MIT License - Free to use for learning and development

---

## 🎉 Features Summary

| Feature | Status |
|---------|--------|
| Voice username input | ✅ |
| Click pattern password | ✅ |
| Voice-guided dashboard | ✅ |
| Compose email with voice | ✅ |
| Inbox with voice readout | ✅ |
| Sent mail tracking | ✅ |
| Trash functionality | ✅ |
| JWT authentication | ✅ |
| MongoDB storage | ✅ |
| Responsive design | ✅ |

---

**🚀 Ready to experience accessible email? Start the servers and say hello to NoSightInbox!**

For questions or issues, check the troubleshooting section above.

