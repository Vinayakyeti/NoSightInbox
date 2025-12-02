import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClickPattern } from '../utils/clickPattern';
import { speak, startListening } from '../utils/voiceUtils';
import './Login.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [clickPattern, setClickPattern] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomeSpoken, setWelcomeSpoken] = useState(false);

  useClickPattern((pattern) => {
    setClickPattern(pattern);
  });

  const handleRegister = async () => {
    if (!username) {
      setError('Please enter username via voice');
      speak('Please enter username via voice');
      return;
    }
    
    if (clickPattern.length < 3) {
      setError('Click pattern must have at least 3 clicks');
      speak('Click pattern must have at least 3 clicks');
      return;
    }

    setLoading(true);
    setError('');
    speak('Registering your account, please wait.');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          clickPattern: clickPattern.join('-'),
          email
        })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        speak('Registration successful. Welcome to your dashboard.');
        navigate('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
        speak(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Connection error. Please try again.');
      speak('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      speak('Welcome to registration. Press Space bar or Enter key to speak your username. Or press Tab to navigate buttons.')
        .then(() => setWelcomeSpoken(true))
        .catch(err => console.error('Speech error:', err));
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !isListening && !loading) {
        e.preventDefault();
        if (!username) {
          handleVoiceInput();
        } else if (e.key === 'Enter' && username && clickPattern.length >= 3) {
          handleRegister();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isListening, loading, username, clickPattern]);

  const handleVoiceInput = () => {
    if (isListening) return;
    
    setIsListening(true);
    
    startListening(
      (transcript) => {
        setUsername(transcript.toLowerCase());
        setIsListening(false);
        speak(`Username captured: ${transcript}. Now create your click pattern password. Minimum 3 clicks anywhere on the screen. Then press Enter to register.`);
      },
      (error) => {
        console.error('Voice input error:', error);
        setIsListening(false);
        speak('Voice input failed. Press Space or Enter to try again.');
      }
    );
  };

  const handleResetPattern = () => {
    setClickPattern([]);
    speak('Click pattern reset. Create new pattern.');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">NoSightInbox Register</h1>
        <p className="login-subtitle">Create Your Voice + Click Pattern Account</p>

        <div className="form-section">
          <label className="form-label">Username (Voice Input - Press Space/Enter)</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-lg"
              value={username}
              readOnly
              placeholder="Press Space or Enter to speak"
              aria-label="Username input - Press Space or Enter to activate voice"
            />
            <button
              className="btn btn-primary btn-lg"
              onClick={handleVoiceInput}
              disabled={isListening}
              onFocus={() => speak('Voice input button. Press Enter to speak your username.')}
              aria-label="Activate voice input"
            >
              {isListening ? '🎤 Listening...' : '🎤 Speak (Space/Enter)'}
            </button>
          </div>
          <p className="voice-hint">💡 Tip: Press Space or Enter key anywhere to start voice input</p>
        </div>

        <div className="form-section">
          <label className="form-label">Email (Optional)</label>
          <input
            type="email"
            className="form-control form-control-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Optional: your@email.com"
          />
        </div>

        <div className="form-section">
          <label className="form-label">Create Click Pattern Password (Min 3 clicks)</label>
          <div className="pattern-display">
            {clickPattern.length > 0 ? (
              <div className="pattern-text">
                {clickPattern.map((click, index) => (
                  <span key={index} className="pattern-item">
                    {click}
                  </span>
                ))}
              </div>
            ) : (
              <p className="pattern-hint">
                Left Click (L) • Right Click (R) • Double Left (DL) • Double Right (DR) • Long Left (LL)
              </p>
            )}
          </div>
          <button
            className="btn btn-secondary btn-lg mt-2"
            onClick={handleResetPattern}
          >
            Reset Pattern
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <button
          className="btn btn-success btn-lg w-100"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>

        <p className="text-center mt-3">
          <button
            className="btn btn-link"
            onClick={() => navigate('/')}
          >
            Already have an account? Login Here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
