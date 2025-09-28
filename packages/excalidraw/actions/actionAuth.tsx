import React, { useState } from 'react';
import { register } from './register';
import { t } from '../i18n';
import { AppState } from '../types';
import { ExcalidrawElement } from '@excalidraw/element/types';
import { CaptureUpdateAction } from '@excalidraw/element';
import { AuthModal } from '../../../excalidraw-app/components/AuthModal';
import { UserProfile } from '../../../excalidraw-app/components/UserProfile';
import { useAuth } from '../../../excalidraw-app/contexts/AuthContext';

export const actionSignIn = register({
  name: 'signIn',
  label: 'Sign In',
  trackEvent: { category: 'auth', action: 'signIn' },
  perform: () => {
    // This action is handled by the UI component
    return { captureUpdate: CaptureUpdateAction.EVENTUALLY };
  },
  predicate: (elements, appState, props, app) => {
    // Only show sign in if not authenticated
    try {
      const { useAuth } = require('../../excalidraw-app/contexts/AuthContext');
      // We can't use the hook here, so we'll always show it and let the component handle the logic
      return true;
    } catch {
      return true;
    }
  },
  PanelComponent: ({ appState, updateData }) => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { isAuthenticated } = useAuth();

    // Don't show sign in button if already authenticated
    if (isAuthenticated) {
      return null;
    }

    return (
      <>
        <button
          type="button"
          onClick={() => setShowAuthModal(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6965db',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Sign In
        </button>
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)} 
            appState={appState}
          />
        )}
      </>
    );
  },
});

export const actionUserProfile = register({
  name: 'userProfile',
  label: 'Profile',
  trackEvent: { category: 'auth', action: 'profile' },
  perform: () => {
    // This action is handled by the UI component
    return { captureUpdate: CaptureUpdateAction.EVENTUALLY };
  },
  predicate: (elements, appState, props, app) => {
    // Always show profile button - authentication check happens in component
    return true;
  },
  PanelComponent: ({ appState, updateData }) => {
    const [showProfile, setShowProfile] = useState(false);
    const { isAuthenticated, user } = useAuth();

    // Don't show profile button if not authenticated
    if (!isAuthenticated) {
      return null;
    }

    return (
      <>
        <button
          type="button"
          onClick={() => setShowProfile(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: appState.theme === 'dark' ? '#ffffff' : '#000000',
            border: `1px solid ${appState.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              style={{ width: '20px', height: '20px', borderRadius: '50%' }}
            />
          ) : (
            <span>👤</span>
          )}
          {user?.displayName || 'Profile'}
        </button>
        {showProfile && (
          <UserProfile 
            onClose={() => setShowProfile(false)} 
            appState={appState}
          />
        )}
      </>
    );
  },
});

export const actionSignOut = register({
  name: 'signOut',
  label: 'Sign Out',
  trackEvent: { category: 'auth', action: 'signOut' },
  perform: async () => {
    // This action is handled by the UI component
    return { captureUpdate: CaptureUpdateAction.EVENTUALLY };
  },
  predicate: (elements, appState, props, app) => {
    // Always show sign out button - authentication check happens in component
    return true;
  },
  PanelComponent: ({ appState, updateData }) => {
    const [loading, setLoading] = useState(false);
    const { isAuthenticated, signOut } = useAuth();

    // Don't show sign out button if not authenticated
    if (!isAuthenticated) {
      return null;
    }

    const handleSignOut = async () => {
      setLoading(true);
      try {
        await signOut();
      } catch (error) {
        console.error('Failed to sign out:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        style={{
          padding: '8px 16px',
          backgroundColor: 'transparent',
          color: appState.theme === 'dark' ? '#ffffff' : '#000000',
          border: `1px solid ${appState.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          width: '100%',
        }}
      >
        {loading ? 'Signing out...' : 'Sign Out'}
      </button>
    );
  },
});

// Premium feature example - Cloud Save
export const actionCloudSave = register({
  name: 'cloudSave',
  label: 'Save to Cloud',
  trackEvent: { category: 'auth', action: 'cloudSave' },
  perform: async (elements, appState, value, app) => {
    // This would integrate with your cloud storage service
    // For now, just show a message
    return {
      appState: {
        ...appState,
        toast: { message: 'Cloud save feature coming soon!' },
      },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    };
  },
  predicate: (elements, appState, props, app) => {
    // Always show cloud save button - authentication check happens in component
    return true;
  },
  PanelComponent: ({ appState, updateData }) => {
    return (
      <button
        type="button"
        onClick={() => updateData(null)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#6965db',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        ☁️ Save to Cloud
      </button>
    );
  },
});
