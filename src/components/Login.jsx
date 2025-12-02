import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClickPattern, registerClickPattern } from '../utils/clickPattern';
import { speak, startListening } from '../utils/voiceUtils';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [clickPattern, setClickPattern] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomeSpoken, setWelcomeSpoken] = useState(false);

  useClickPattern((pattern) => {
    setClickPattern(pattern);
  });

  const handleLogin = async () => {
    if (!username) {
      setError('Please enter username via voice');
      speak('Please enter username via voice');
      return;
    }
    
    if (clickPattern.length === 0) {
      setError('Please enter click pattern');
      speak('Please enter click pattern');
      return;
    }

    setLoading(true);
    setError('');
    speak('Logging in, please wait.');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          clickPattern: clickPattern.join('-')
        })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        speak('Login successful. Welcome to your dashboard.');
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
        speak(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
      speak('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      speak('Welcome to No Sight Inbox. Press Space bar or Enter key to speak your username. New user? Press R key or use Triple Right Click to register.')
        .then(() => setWelcomeSpoken(true))
        .catch(err => console.error('Speech error:', err));
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !isListening && !loading && !username) {
        e.preventDefault();
        handleVoiceInput();
      }
      else if (e.key === 'Enter' && !isListening && !loading && username && clickPattern.length > 0) {
        e.preventDefault();
        handleLogin();
      }
      else if ((e.key === 'r' || e.key === 'R') && !isListening && !loading) {
        e.preventDefault();
        speak('Navigating to registration page.');
        navigate('/register');
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isListening, loading, username, clickPattern]);

  useEffect(() => {
    const unregister = registerClickPattern('R-R-R', () => {
      if (!loading) {
        speak('Navigating to registration page.');
        navigate('/register');
      }
    });
    
    return () => {
      unregister();
    };
  }, [loading]);

  const handleVoiceInput = () => {
    if (isListening) return;
    
    setIsListening(true);
    
    startListening(
      (transcript) => {
        setUsername(transcript.toLowerCase());
        setIsListening(false);
        speak(`Username captured: ${transcript}. Now enter your click pattern password using mouse clicks anywhere on the screen. Then press Enter to login.`);
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
    speak('Click pattern reset. Enter new pattern.');
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">NoSightInbox Login</h1>
        <p className="login-subtitle">Voice + Click Pattern Authentication</p>

        <div className="form-section">
          <label className="form-label">Username (Voice Input - Press Space/Enter)</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-lg"
              value={username}
              readOnly
              placeholder="Press Space or Enter to speak"
              aria-label="Username input field - Press Space or Enter to activate voice"
            />
            <button
              className="btn btn-primary btn-lg"
              onClick={handleVoiceInput}
              disabled={isListening}
              onFocus={() => speak('Voice input button. Press Enter to speak your username.')}
              aria-label="Activate voice input for username"
            >
              {isListening ? '🎤 Listening...' : '🎤 Speak (Space/Enter)'}
            </button>
          </div>
          <p className="voice-hint">💡 Tip: Press Space or Enter key anywhere to start voice input</p>
          <p className="voice-hint">🆕 New User? Press R key or Triple Right Click (R-R-R) to register</p>
        </div>

        <div className="form-section">
          <label className="form-label">Click Pattern Password</label>
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
            onFocus={() => speak('Reset pattern button. Press Enter to clear your click pattern.')}
            aria-label="Reset click pattern"
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
          onClick={handleLogin}
          disabled={loading}
          onFocus={() => speak('Login button. Press Enter to submit your credentials.')}
          aria-label="Submit login credentials"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center mt-3">
          <button
            className="btn btn-link"
            onClick={() => navigate('/register')}
            onFocus={() => speak('Register button. Press Enter to create a new account.')}
            aria-label="Navigate to registration page"
          >
            New User? Register Here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
