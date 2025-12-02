import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { speak } from '../utils/voiceUtils';
import { registerClickPattern } from '../utils/clickPattern';
import './Mail.css';

const Trash = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrash = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/mail/trash', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setEmails(data.emails);
        speak(`Trash loaded. You have ${data.count} deleted emails. Press B or Escape to go back, or double left click.`);
      } else {
        setError(data.error || 'Failed to load trash');
        speak('Failed to load trash');
      }
    } catch (error) {
      console.error('Fetch trash error:', error);
      setError('Connection error');
      speak('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') {
        if (!selectedEmail) {
          speak('Going back to dashboard');
          navigate('/dashboard');
        }
      }
    };

    const unregisterClick = registerClickPattern('DL', () => {
      if (!selectedEmail) {
        speak('Going back to dashboard');
        navigate('/dashboard');
      }
    });

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      unregisterClick();
    };
  }, [navigate, selectedEmail]);

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    speak(`Deleted email from ${email.from} to ${email.to}. Subject: ${email.subject}. Message: ${email.body}`);
  };

  const handleCloseModal = () => {
    setSelectedEmail(null);
    speak('Email closed');
  };

  if (loading) {
    return (
      <div className="mail-container">
        <div className="mail-card">
          <h1 className="mail-title">Loading Trash...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="mail-container">
      <div className="mail-card">
        <div className="mail-header">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <h1 className="mail-title">Trash ({emails.length})</h1>
          <button className="btn btn-info" onClick={fetchTrash}>
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {emails.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗑️</div>
            <p className="empty-state-text">Trash is empty</p>
          </div>
        ) : (
          <div className="email-list">
            {emails.map((email) => (
              <div
                key={email.id}
                className="email-item"
                onClick={() => handleEmailClick(email)}
              >
                <div className="email-header">
                  <span className="email-from">
                    From: {email.from} → To: {email.to}
                  </span>
                  <span className="email-date">
                    {new Date(email.trashedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="email-subject">{email.subject}</div>
                <div className="email-preview">{email.body}</div>
              </div>
            ))}
          </div>
        )}

        {selectedEmail && (
          <div className="email-modal" onClick={handleCloseModal}>
            <div className="email-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="email-modal-header">
                <div>
                  <h2>{selectedEmail.subject}</h2>
                  <p><strong>From:</strong> {selectedEmail.from}</p>
                  <p><strong>To:</strong> {selectedEmail.to}</p>
                  <p><strong>Deleted:</strong> {new Date(selectedEmail.trashedAt).toLocaleString()}</p>
                </div>
                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  ✕ Close
                </button>
              </div>
              <div className="email-modal-body">
                {selectedEmail.body}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trash;
