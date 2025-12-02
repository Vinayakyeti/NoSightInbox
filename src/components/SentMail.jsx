import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { speak } from '../utils/voiceUtils';
import { registerClickPattern } from '../utils/clickPattern';
import './Mail.css';

const SentMail = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSent = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/mail/sent', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setEmails(data.emails);
        speak(`Sent mail loaded. You have ${data.count} sent emails. Press B or Escape to go back, or double left click.`);
      } else {
        setError(data.error || 'Failed to load sent mail');
        speak('Failed to load sent mail');
      }
    } catch (error) {
      console.error('Fetch sent mail error:', error);
      setError('Connection error');
      speak('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSent();
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
    speak(`Email to ${email.to}. Subject: ${email.subject}. Message: ${email.body}`);
  };

  const handleCloseModal = () => {
    setSelectedEmail(null);
    speak('Email closed');
  };

  const handleDelete = async (emailId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/mail/${emailId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setEmails(emails.filter(e => e.id !== emailId));
        setSelectedEmail(null);
        speak('Email moved to trash');
      }
    } catch (error) {
      console.error('Delete email error:', error);
      speak('Failed to delete email');
    }
  };

  if (loading) {
    return (
      <div className="mail-container">
        <div className="mail-card">
          <h1 className="mail-title">Loading Sent Mail...</h1>
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
          <h1 className="mail-title">Sent Mail ({emails.length})</h1>
          <button className="btn btn-info" onClick={fetchSent}>
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
            <div className="empty-state-icon">📤</div>
            <p className="empty-state-text">No sent emails</p>
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
                  <span className="email-to">To: {email.to}</span>
                  <span className="email-date">
                    {new Date(email.sentAt).toLocaleDateString()}
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
                  <p><strong>To:</strong> {selectedEmail.to}</p>
                  <p><strong>Date:</strong> {new Date(selectedEmail.sentAt).toLocaleString()}</p>
                </div>
                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  ✕ Close
                </button>
              </div>
              <div className="email-modal-body">
                {selectedEmail.body}
              </div>
              <div className="button-group mt-3">
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(selectedEmail.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentMail;
