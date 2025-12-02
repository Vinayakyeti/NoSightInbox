import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { speak } from '../utils/voiceUtils';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    speak(`Welcome ${user?.username}. Left click to compose mail. Right click for sent mail. Double left click for inbox. Double right click to logout. Long left click for trash.`);
    let lastClickTime = 0;
    let lastButton = -1;
    let longPressTimer = null;
    let singleClickTimer = null;
    let isLongPress = false;

    const handleMouseDown = (event) => {
      const button = event.button;
      isLongPress = false;
      
      if (button === 0) {
        longPressTimer = setTimeout(() => {
          isLongPress = true;
          speak('Opening trash');
          navigate('/trash');
        }, 700);
      }
    };

    const handleMouseUp = (event) => {
      event.preventDefault();
      const button = event.button;
      const currentTime = Date.now();
      
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      
      if (isLongPress) {
        isLongPress = false;
        return;
      }
      
      const timeSinceLastClick = currentTime - lastClickTime;
      const isSameButton = button === lastButton;
      
      if (timeSinceLastClick < 300 && isSameButton) {
        if (singleClickTimer) {
          clearTimeout(singleClickTimer);
          singleClickTimer = null;
        }
        
        if (button === 0) {
          speak('Opening inbox');
          navigate('/inbox');
        } else if (button === 2) {
          speak('Logging out');
          logout();
          navigate('/');
        }
        
        lastClickTime = 0;
        lastButton = -1;
      } else {
        if (singleClickTimer) {
          clearTimeout(singleClickTimer);
        }
        
        singleClickTimer = setTimeout(() => {
          if (button === 0) {
            speak('Opening compose mail');
            navigate('/compose');
          } else if (button === 2) {
            speak('Opening sent mail');
            navigate('/sent');
          }
          singleClickTimer = null;
        }, 300);
        
        lastClickTime = currentTime;
        lastButton = button;
      }
    };

    const handleContextMenu = (event) => {
      event.preventDefault();
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenu);
      if (longPressTimer) clearTimeout(longPressTimer);
      if (singleClickTimer) clearTimeout(singleClickTimer);
    };
  }, [navigate, logout, user]);

  const repeatInstructions = () => {
    speak(`Dashboard navigation. Left click to compose mail. Right click for sent mail. Double left click for inbox. Double right click to logout. Long left click for trash.`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">NoSightInbox Dashboard</h1>
        <p className="dashboard-user">Welcome, {user?.username}</p>
        <button className="btn btn-info btn-lg" onClick={repeatInstructions}>
          🔊 Repeat Instructions
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card compose-card">
          <div className="card-icon">✉️</div>
          <h2 className="card-title">Compose Mail</h2>
          <p className="card-action">Left Click</p>
        </div>

        <div className="dashboard-card sent-card">
          <div className="card-icon">📤</div>
          <h2 className="card-title">Sent Mail</h2>
          <p className="card-action">Right Click</p>
        </div>

        <div className="dashboard-card inbox-card">
          <div className="card-icon">📥</div>
          <h2 className="card-title">Inbox</h2>
          <p className="card-action">Double Left Click</p>
        </div>

        <div className="dashboard-card trash-card">
          <div className="card-icon">🗑️</div>
          <h2 className="card-title">Trash</h2>
          <p className="card-action">Long Left Click</p>
        </div>

        <div className="dashboard-card logout-card">
          <div className="card-icon">🚪</div>
          <h2 className="card-title">Logout</h2>
          <p className="card-action">Double Right Click</p>
        </div>
      </div>

      <div className="dashboard-footer">
        <p className="footer-text">
          Click anywhere on the screen to navigate • Use mouse clicks only
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
