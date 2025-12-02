import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { speak } from '../utils/voiceUtils';
import { registerClickPattern } from '../utils/clickPattern';
import './Mail.css';

const Inbox = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInbox = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/mail/inbox', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setEmails(data.emails);
        
        const unreadCount = data.emails.filter(e => !e.isRead).length;
        speak(`Inbox loaded. You have ${data.count} emails, ${unreadCount} unread. Press B or Escape to go back, or double left click.`);
      } else {
        setError(data.error || 'Failed to load inbox');
        speak('Failed to load inbox');
      }
    } catch (error) {
      console.error('Fetch inbox error:', error);
      setError('Connection error');
      speak('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
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

  const handleEmailClick = async (email) => {
    setSelectedEmail(email);
    
    speak(`Email from ${email.from}. Subject: ${email.subject}. Message: ${email.body}`);
    
    if (!email.isRead) {
      try {
        await fetch(`http://localhost:5000/api/mail/${email.id}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setEmails(emails.map(e => 
          e.id === email.id ? { ...e, isRead: true } : e
        ));
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    }
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
          <h1 className="mail-title">Loading Inbox...</h1>
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
          <h1 className="mail-title">Inbox ({emails.length})</h1>
          <button className="btn btn-info" onClick={fetchInbox}>
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
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text">No emails in inbox</p>
          </div>
        ) : (
          <div className="email-list">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`email-item ${!email.isRead ? 'unread' : ''}`}
                onClick={() => handleEmailClick(email)}
              >
                <div className="email-header">
                  <span className="email-from">
                    From: {email.from}
                    {!email.isRead && <span className="email-badge badge-unread">NEW</span>}
                  </span>
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
                  <p><strong>From:</strong> {selectedEmail.from}</p>
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

export default Inbox;
