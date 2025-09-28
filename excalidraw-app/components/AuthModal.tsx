import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { t } from '@excalidraw/excalidraw/i18n';
import { CloseIcon } from '@excalidraw/excalidraw/components/icons';
import { ToolButton } from '@excalidraw/excalidraw/components/ToolButton';
import { AppState } from '@excalidraw/excalidraw/types';
import './AuthModal.scss';

interface AuthModalProps {
  onClose: () => void;
  appState: AppState;
}

type AuthMode = 'signin' | 'signup' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, appState }) => {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signUp(email, password, displayName);
        onClose();
      } else if (mode === 'reset') {
        await resetPassword(email);
        setError('Password reset email sent! Check your inbox.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message);
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
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'reset' && 'Reset Password'}
          </h2>
          <ToolButton
            type="button"
            icon={CloseIcon}
            aria-label="Close"
            onClick={onClose}
            size="small"
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={mode === 'signup'}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                  borderRadius: '4px',
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#000000',
                  fontSize: '14px',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                borderRadius: '4px',
                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#000000',
                fontSize: '14px',
              }}
            />
          </div>

          {mode !== 'reset' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={mode !== 'reset'}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
                  borderRadius: '4px',
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#000000',
                  fontSize: '14px',
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#6965db',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '12px',
            }}
          >
            {loading ? 'Loading...' : (
              mode === 'signin' ? 'Sign In' :
              mode === 'signup' ? 'Create Account' :
              'Send Reset Email'
            )}
          </button>
        </form>

        {mode !== 'reset' && (
          <button
            type="button"
            onClick={handleGoogleSignIn}
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
              marginBottom: '16px',
            }}
          >
            Continue with Google
          </button>
        )}

        <div style={{ textAlign: 'center', fontSize: '14px' }}>
          {mode === 'signin' && (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6965db',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Sign up
              </button>
              {' • '}
              <button
                type="button"
                onClick={() => setMode('reset')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6965db',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Forgot password?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6965db',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Sign in
              </button>
            </>
          )}
          {mode === 'reset' && (
            <>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6965db',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
