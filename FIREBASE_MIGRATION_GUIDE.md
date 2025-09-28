# Firebase Migration Guide

## Current Firebase Projects

### Development Environment:
- **Project ID**: `excalidraw-oss-dev`
- **Storage Bucket**: `excalidraw-oss-dev.appspot.com`
- **Auth Domain**: `excalidraw-oss-dev.firebaseapp.com`

### Production Environment:
- **Project ID**: `excalidraw-room-persistence`
- **Storage Bucket**: `excalidraw-room-persistence.appspot.com`
- **Auth Domain**: `excalidraw-room-persistence.firebaseapp.com`

## Migration Steps

### 1. Create Your Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter your project name (e.g., `your-app-name`)
4. Enable Google Analytics (optional)
5. Create the project

### 2. Enable Required Services

#### Enable Firestore Database:
1. In Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for now)
4. Select a location close to your users

#### Enable Firebase Storage:
1. In Firebase Console → **Storage**
2. Click **"Get started"**
3. Choose **"Start in test mode"**
4. Select the same location as Firestore

#### Enable Authentication (if needed):
1. In Firebase Console → **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable desired providers (Email/Password, Google, etc.)

### 3. Get Your Firebase Configuration

1. In Firebase Console → **Project Settings** (gear icon)
2. Scroll down to **"Your apps"** section
3. Click **"Add app"** → **Web app** (</> icon)
4. Register your app with a nickname
5. **Copy the Firebase configuration object**

### 4. Update Environment Variables

#### Development Environment (.env.development):
```bash
VITE_APP_FIREBASE_CONFIG='{"apiKey":"YOUR_API_KEY","authDomain":"your-project-dev.firebaseapp.com","projectId":"your-project-dev","storageBucket":"your-project-dev.appspot.com","messagingSenderId":"YOUR_SENDER_ID","appId":"YOUR_APP_ID"}'
```

#### Production Environment (.env.production):
```bash
VITE_APP_FIREBASE_CONFIG='{"apiKey":"YOUR_API_KEY","authDomain":"your-project-prod.firebaseapp.com","projectId":"your-project-prod","storageBucket":"your-project-prod.appspot.com","messagingSenderId":"YOUR_SENDER_ID","appId":"YOUR_APP_ID"}'
```

### 5. Deploy Firebase Rules

The project includes Firebase rules in the `firebase-project/` directory:

#### Firestore Rules (firestore.rules):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow get, write: if true;
      // never set this to true, otherwise anyone can delete anyone else's drawing.
      allow list: if false;
    }
  }
}
```

#### Storage Rules (storage.rules):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{files}/rooms/{room}/{file} {
    	allow get, write: if true;
    }
    match /{files}/shareLinks/{shareLink}/{file} {
    	allow get, write: if true;
    }
  }
}
```

#### Deploy Rules:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
cd firebase-project
firebase init

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 6. Update Firebase Project Configuration

Update the `.firebaserc` file in the `firebase-project/` directory:

```json
{
  "projects": {
    "default": "your-new-project-id"
  }
}
```

### 7. Security Considerations

⚠️ **Important**: The current rules are very permissive for development. For production, consider:

1. **Implement proper authentication**
2. **Add user-based access controls**
3. **Set up proper security rules**
4. **Enable App Check for additional security**

### 8. Test Your Setup

1. Start your development server:
   ```bash
   yarn start
   ```

2. Test collaboration features
3. Test file uploads
4. Verify data is being stored in your Firebase project

### 9. Production Deployment

1. Update your production environment variables
2. Deploy your application
3. Monitor Firebase usage and costs
4. Set up proper monitoring and alerts

## Firebase Services Used

- **Firestore Database**: Stores scene data and collaboration information
- **Firebase Storage**: Stores uploaded files and images
- **Firebase Authentication**: User management (if implemented)

## Cost Considerations

- **Firestore**: Pay per read/write operation
- **Storage**: Pay per GB stored and transferred
- **Authentication**: Free tier available
- Monitor usage in Firebase Console

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Pricing](https://firebase.google.com/pricing)
