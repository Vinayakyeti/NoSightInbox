import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { speak, startListening } from '../utils/voiceUtils';
import { registerClickPattern } from '../utils/clickPattern';
import './Mail.css';

const ComposeMail = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      speak('Compose mail. Press Space or Enter to activate voice input for recipient. Say at for @ symbol and dot for period. Press Escape to stop microphone. Or use Tab to navigate fields. Press Enter to send when all fields are complete. Press B or Escape to go back to dashboard, or double left click.')
        .catch(err => console.error('Speech error:', err));
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.key === 'b' || e.key === 'B' || e.key === 'Escape') && !isListening) {
        e.preventDefault();
        speak('Going back to dashboard');
        navigate('/dashboard');
        return;
      }
      
      if (e.key === 'Escape' && isListening) {
        e.preventDefault();
        if (recognitionInstance) {
          recognitionInstance.stop();
          setIsListening(false);
          setRecognitionInstance(null);
          speak('Microphone stopped. Press Space or Enter to continue.');
        }
        return;
      }
      
      if ((e.key === ' ' || e.key === 'Enter') && !isListening && !loading) {
        e.preventDefault();
        
        if (e.key === 'Enter' && recipient && subject && body) {
          handleSend();
        }
        else if (!recipient) {
          handleVoiceInput('recipient');
        } else if (!subject) {
          handleVoiceInput('subject');
        } else if (!body) {
          handleVoiceInput('body');
        }
      }
    };

    const unregisterClick = registerClickPattern('DL', () => {
      if (!isListening) {
        speak('Going back to dashboard');
        navigate('/dashboard');
      }
    });
    
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      unregisterClick();
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [recipient, subject, body, isListening, loading, recognitionInstance]);

  const handleVoiceInput = (field) => {
    if (isListening) return;
    
    setCurrentField(field);
    setIsListening(true);
    
    const recognition = startListening(
      (transcript) => {
        let processedText = transcript;
        
        if (field === 'recipient') {
          processedText = processedText.toLowerCase()
            .replace(/\s+at\s+/gi, '@')
            .replace(/\s+dot\s+/gi, '.')
            .replace(/\s+/g, '');
          
          setRecipient(processedText);
          speak(`Recipient captured: ${processedText}.`);
        } else if (field === 'subject') {
          setSubject(processedText);
          speak(`Subject captured: ${processedText}.`);
        } else if (field === 'body') {
          setBody(processedText);
          speak(`Message captured. Press Enter to send email.`);
        }
        
        setIsListening(false);
        setCurrentField('');
        setRecognitionInstance(null);
      },
      (error) => {
        console.error('Voice input error:', error);
        setIsListening(false);
        setCurrentField('');
        setRecognitionInstance(null);
        speak('Voice input failed. Press Space or Enter to try again.');
      }
    );
    
    setRecognitionInstance(recognition);
  };

  const handleSend = async () => {
    if (!recipient || !subject || !body) {
      setError('Please fill all fields using voice input');
      speak('Please fill all fields using voice input');
      return;
    }

    setLoading(true);
    setError('');
    speak('Sending email, please wait.');
    
    try {
      const response = await fetch('http://localhost:5000/api/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: recipient,
          subject,
          body
        })
      });

      const data = await response.json();

      if (response.ok) {
        speak('Email sent successfully. Returning to dashboard.');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(data.error || 'Failed to send email');
        speak(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Send email error:', error);
      setError('Connection error. Please try again.');
      speak('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRecipient('');
    setSubject('');
    setBody('');
    speak('Form cleared');
  };
  
  return (
    <div className="mail-container">
      <div className="mail-card">
        <div className="mail-header">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <h1 className="mail-title">Compose Mail</h1>
        </div>

        <div className="form-section">
          <label className="form-label">To (Recipient Email - Say "at" for @ and "dot" for .)</label>
          <div className={`input-group ${isListening && currentField === 'recipient' ? 'listening' : ''}`}>
            <input
              type="text"
              className="form-control form-control-lg"
              value={recipient}
              readOnly
              placeholder="e.g., speak: john at gmail dot com"
              aria-label="Recipient email - Press Space or Enter to activate voice"
            />
            <button
              className="btn btn-primary btn-lg"
              onClick={() => handleVoiceInput('recipient')}
              disabled={isListening}
              onFocus={() => speak('Recipient field. Press Enter to speak the recipient email. Say at for @ symbol and dot for period.')}
              aria-label="Voice input for recipient"
            >
              {isListening && currentField === 'recipient' ? '🎤 Listening...' : '🎤 Speak'}
            </button>
          </div>
          <p className="voice-hint">💡 Example: Say "john at gmail dot com" for john@gmail.com</p>
        </div>

        <div className="form-section">
          <label className="form-label">Subject (Press Space/Enter)</label>
          <div className={`input-group ${isListening && currentField === 'subject' ? 'listening' : ''}`}>
            <input
              type="text"
              className="form-control form-control-lg"
              value={subject}
              readOnly
              placeholder="Press Space or Enter to speak"
              aria-label="Email subject - Press Space or Enter to activate voice"
            />
            <button
              className="btn btn-primary btn-lg"
              onClick={() => handleVoiceInput('subject')}
              disabled={isListening}
              onFocus={() => speak('Subject field. Press Enter to speak the email subject.')}
              aria-label="Voice input for subject"
            >
              {isListening && currentField === 'subject' ? '🎤 Listening...' : '🎤 Speak'}
            </button>
          </div>
          <p className="voice-hint">💡 Press Escape to stop recording</p>
        </div>

        <div className="form-section">
          <label className="form-label">Message (Press Space/Enter)</label>
          <div className={`input-group ${isListening && currentField === 'body' ? 'listening' : ''}`}>
            <textarea
              className="form-control form-control-lg"
              rows="6"
              value={body}
              readOnly
              placeholder="Press Space or Enter to speak"
              aria-label="Email message - Press Space or Enter to activate voice"
            />
            <button
              className="btn btn-primary btn-lg"
              onClick={() => handleVoiceInput('body')}
              disabled={isListening}
              onFocus={() => speak('Message field. Press Enter to speak the email message.')}
              aria-label="Voice input for message"
            >
              {isListening && currentField === 'body' ? '🎤 Listening...' : '🎤 Speak'}
            </button>
          </div>
          <p className="voice-hint">💡 Press Escape to stop recording</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="button-group">
          {isListening && (
            <button
              className="btn btn-danger btn-lg"
              onClick={() => {
                if (recognitionInstance) {
                  recognitionInstance.stop();
                  setIsListening(false);
                  setRecognitionInstance(null);
                  speak('Microphone stopped. Press Space or Enter to continue.');
                }
              }}
              aria-label="Stop microphone - Press Escape"
            >
              ⏹️ Stop Mic (Escape)
            </button>
          )}
          <button
            className="btn btn-success btn-lg"
            onClick={handleSend}
            disabled={loading || isListening}
          >
            {loading ? 'Sending...' : '📧 Send Email'}
          </button>
          <button
            className="btn btn-warning btn-lg"
            onClick={handleClear}
            disabled={isListening}
          >
            🗑️ Clear Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposeMail;
