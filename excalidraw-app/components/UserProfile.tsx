import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { t } from '@excalidraw/excalidraw/i18n';
import { CloseIcon, usersIcon } from '@excalidraw/excalidraw/components/icons';
import { ToolButton } from '@excalidraw/excalidraw/components/ToolButton';
import { AppState } from '@excalidraw/excalidraw/types';
import './AuthModal.scss';

interface UserProfileProps {
  onClose: () => void;
  appState: AppState;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose, appState }) => {
  const { user, signOut, isPremium } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Failed to sign out:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDarkMode = appState.theme === 'dark';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content ${isDarkMode ? 'dark' : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
          border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            Profile
          </h2>
          <ToolButton
            type="button"
            icon={CloseIcon}
            aria-label="Close"
            onClick={onClose}
            size="small"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#6965db',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '16px',
            fontSize: '24px',
            color: '#ffffff',
          }}>
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
              />
            ) : (
              <div style={{ fontSize: '24px' }}>{usersIcon}</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
              {user?.displayName || 'Anonymous User'}
            </div>
            <div style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#666666' }}>
              {user?.email}
            </div>
          </div>
        </div>

        {isPremium && (
          <div style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f8ff',
            border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                color: '#6965db',
              }}>
                ✨ Premium Features
              </span>
            </div>
            <div style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#666666' }}>
              You have access to all premium features including:
            </div>
            <ul style={{ 
              fontSize: '14px', 
              color: isDarkMode ? '#cccccc' : '#666666',
              margin: '8px 0 0 0',
              paddingLeft: '20px',
            }}>
              <li>Unlimited cloud storage</li>
              <li>Advanced collaboration tools</li>
              <li>Priority support</li>
              <li>Export to multiple formats</li>
            </ul>
          </div>
        )}

        <div style={{ borderTop: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`, paddingTop: '16px' }}>
          <button
            onClick={handleSignOut}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
              color: isDarkMode ? '#ffffff' : '#000000',
              border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
};
