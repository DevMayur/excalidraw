# Excalidraw Authentication System

This guide explains how to set up and use the optional authentication system in Excalidraw.

## Overview

The authentication system is designed to be **optional** - users can use Excalidraw without signing in, but certain premium features require authentication. This approach maintains the open and accessible nature of Excalidraw while enabling advanced features for authenticated users.

## Features

### Core Authentication
- **Email/Password Sign In**: Traditional email and password authentication
- **Google Sign In**: One-click authentication with Google accounts
- **Password Reset**: Users can reset their passwords via email
- **User Profiles**: Display user information and premium status

### Premium Features (Require Authentication)
- **Cloud Storage**: Save drawings to personal cloud storage
- **Premium Export**: High-resolution exports, batch exports, custom templates
- **Advanced Collaboration**: Private rooms, user management, permissions
- **Priority Support**: Enhanced customer support for premium users

### Optional Features (Work Without Authentication)
- **Basic Drawing**: All core drawing functionality
- **Local Storage**: Save drawings locally
- **Basic Collaboration**: Public collaboration rooms
- **Standard Export**: PNG, SVG, and JSON exports

## Setup Instructions

### 1. Firebase Configuration

The authentication system uses Firebase Authentication. You need to:

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication
   - Enable Firestore Database
   - Enable Firebase Storage

2. **Configure Authentication Providers**:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google (optional)

3. **Set Environment Variables**:
   ```bash
   # .env.development
   VITE_APP_FIREBASE_CONFIG='{"apiKey":"YOUR_API_KEY","authDomain":"your-project.firebaseapp.com","projectId":"your-project","storageBucket":"your-project.appspot.com","messagingSenderId":"YOUR_SENDER_ID","appId":"YOUR_APP_ID"}'
   ```

### 2. Security Rules

Update your Firestore and Storage rules to support authentication:

**Firestore Rules** (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public access to collaboration rooms (existing behavior)
    match /scenes/{roomId} {
      allow read, write: if true;
    }
  }
}
```

**Storage Rules** (`storage.rules`):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to access their files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public access to collaboration files (existing behavior)
    match /files/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## Usage

### Basic Authentication

The authentication system is automatically available throughout the app via the `useAuth` hook:

```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  
  if (isAuthenticated) {
    return <div>Welcome, {user?.displayName}!</div>;
  }
  
  return <button onClick={() => signIn('email', 'password')}>Sign In</button>;
}
```

### Protecting Premium Features

Use the `AuthGuard` component to protect premium features:

```typescript
import { AuthGuard } from './components/AuthGuard';

function PremiumFeature() {
  return (
    <AuthGuard requirePremium={true} appState={appState}>
      <div>This is a premium feature!</div>
    </AuthGuard>
  );
}
```

### Adding New Premium Actions

Create new actions that require authentication:

```typescript
export const actionMyPremiumFeature = register({
  name: 'myPremiumFeature',
  label: 'My Premium Feature',
  predicate: (elements, appState, props, app) => {
    const { isAuthenticated, isPremium } = useAuth();
    return isAuthenticated && isPremium;
  },
  PanelComponent: ({ appState, updateData }) => {
    return (
      <AuthGuard appState={appState} requirePremium={true}>
        <button onClick={() => updateData(null)}>
          Premium Feature
        </button>
      </AuthGuard>
    );
  },
});
```

## User Experience

### For Anonymous Users
- Full access to core drawing features
- Can save locally and export normally
- Can participate in public collaboration
- See "Sign In" option in command palette
- Premium features show upgrade prompts

### For Authenticated Users
- Access to all core features
- Personal cloud storage
- Premium export options
- Advanced collaboration features
- User profile management
- See "Profile" and "Sign Out" options

### For Premium Users
- All authenticated user features
- Unlimited cloud storage
- Advanced export formats
- Private collaboration rooms
- Priority support access

## Command Palette Integration

Authentication actions are automatically available in the command palette:

- **Sign In**: Available when not authenticated
- **Profile**: Available when authenticated
- **Save to Cloud**: Available for premium users
- **Premium Export**: Available for premium users

## Customization

### Styling
The authentication components use CSS classes that can be customized:
- `.modal-overlay`: Modal backdrop
- `.modal-content`: Modal container
- `.auth-form-*`: Form elements
- `.profile-*`: Profile components

### Premium Logic
The `isPremium` logic can be customized in `AuthContext.tsx`:
```typescript
// Current implementation: all authenticated users are premium
const isPremium = user !== null;

// Custom implementation: check subscription status
const isPremium = user !== null && user.subscriptionStatus === 'active';
```

## Security Considerations

1. **Client-Side Validation**: Authentication state is managed client-side for UX, but all sensitive operations should be validated server-side
2. **Firebase Rules**: Implement proper Firestore and Storage rules
3. **API Keys**: Keep Firebase configuration secure
4. **User Data**: Respect user privacy and implement proper data handling

## Troubleshooting

### Common Issues

1. **Firebase Config Not Found**: Ensure `VITE_APP_FIREBASE_CONFIG` is properly set
2. **Authentication Not Working**: Check Firebase project configuration and enabled providers
3. **Premium Features Not Showing**: Verify user authentication status and premium logic

### Debug Mode

Enable debug logging by setting:
```typescript
// In AuthContext.tsx
const DEBUG_AUTH = true;
```

## Migration from Existing Setup

If you're adding authentication to an existing Excalidraw installation:

1. **Backup**: Backup your existing Firebase configuration
2. **Update Rules**: Apply new Firestore and Storage rules
3. **Test**: Test both authenticated and anonymous user flows
4. **Gradual Rollout**: Consider feature flags for gradual rollout

## Support

For issues with the authentication system:
1. Check Firebase Console for authentication logs
2. Verify environment variables
3. Test with different user accounts
4. Check browser console for errors

The authentication system is designed to be robust and user-friendly while maintaining Excalidraw's core principle of accessibility.
