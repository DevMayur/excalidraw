import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AuthDebug: React.FC = () => {
  const { user, loading, isAuthenticated, isPremium } = useAuth();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: '#000',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace',
      maxWidth: '300px',
    }}>
      <div><strong>Auth Debug Info:</strong></div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>Premium: {isPremium ? 'Yes' : 'No'}</div>
      <div>User: {user ? user.email || 'No email' : 'None'}</div>
      <div>Firebase Config: {(import.meta as any).env.VITE_APP_FIREBASE_CONFIG ? 'Set' : 'Missing'}</div>
    </div>
  );
};
