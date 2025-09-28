import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { AppState } from '@excalidraw/excalidraw/types';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requirePremium?: boolean;
  onAuthRequired?: () => void;
  appState: AppState;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback, 
  requirePremium = false,
  onAuthRequired,
  appState 
}) => {
  const { isAuthenticated, isPremium, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !isAuthenticated && onAuthRequired) {
      onAuthRequired();
    }
  }, [loading, isAuthenticated, onAuthRequired]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '20px' 
      }}>
        Loading...
      </div>
    );
  }

  // Check if user needs to be authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: appState.theme === 'dark' ? '#1e1e1e' : '#ffffff',
        color: appState.theme === 'dark' ? '#ffffff' : '#000000',
        borderRadius: '8px',
        border: `1px solid ${appState.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
      }}>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Sign in required
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: appState.theme === 'dark' ? '#cccccc' : '#666666',
          marginBottom: '20px',
          maxWidth: '300px',
        }}>
          This feature requires you to be signed in to your account.
        </div>
        <button
          onClick={() => setShowAuthModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6965db',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
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
      </div>
    );
  }

  // Check if user needs premium access
  if (requirePremium && !isPremium) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: appState.theme === 'dark' ? '#1e1e1e' : '#ffffff',
        color: appState.theme === 'dark' ? '#ffffff' : '#000000',
        borderRadius: '8px',
        border: `1px solid ${appState.theme === 'dark' ? '#404040' : '#e0e0e0'}`,
      }}>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Premium Feature
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: appState.theme === 'dark' ? '#cccccc' : '#666666',
          marginBottom: '20px',
          maxWidth: '300px',
        }}>
          This feature is available to premium users only. Upgrade your account to access advanced features.
        </div>
        <button
          onClick={() => {
            // In a real app, this would redirect to a subscription page
            alert('Premium upgrade coming soon!');
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6965db',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
