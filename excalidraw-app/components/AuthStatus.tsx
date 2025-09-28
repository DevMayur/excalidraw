import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { UserProfile } from './UserProfile';
import { AppState } from '@excalidraw/excalidraw/types';

interface AuthStatusProps {
  appState: AppState;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({ appState }) => {
  const { user, isAuthenticated, isPremium } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: appState.theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
        borderRadius: '6px',
        fontSize: '14px',
      }}>
        <span>👤</span>
        <button
          onClick={() => setShowAuthModal(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#6965db',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '14px',
          }}
        >
          Sign in for premium features
        </button>
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)} 
            appState={appState}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: appState.theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
      borderRadius: '6px',
      fontSize: '14px',
    }}>
      {user?.photoURL ? (
        <img 
          src={user.photoURL} 
          alt="Profile" 
          style={{ 
            width: '24px', 
            height: '24px', 
            borderRadius: '50%',
            cursor: 'pointer',
          }}
          onClick={() => setShowProfile(true)}
        />
      ) : (
        <span 
          style={{ cursor: 'pointer' }}
          onClick={() => setShowProfile(true)}
        >
          👤
        </span>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '500' }}>
          {user?.displayName || 'User'}
        </div>
        {isPremium && (
          <div style={{ 
            fontSize: '12px', 
            color: '#6965db',
            fontWeight: '500',
          }}>
            ✨ Premium
          </div>
        )}
      </div>
      {showProfile && (
        <UserProfile 
          onClose={() => setShowProfile(false)} 
          appState={appState}
        />
      )}
    </div>
  );
};
