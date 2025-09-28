# Firebase Setup Guide for Authentication

## 🚨 Sign-In Not Working? Follow These Steps

### **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "excalidraw-auth")
4. Enable Google Analytics (optional)
5. Create the project

### **Step 2: Enable Authentication**

1. In Firebase Console → **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **Email/Password**
5. Enable **Google** (optional)

### **Step 3: Enable Firestore Database**

1. In Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for now)
4. Select a location close to your users

### **Step 4: Enable Firebase Storage**

1. In Firebase Console → **Storage**
2. Click **"Get started"**
3. Choose **"Start in test mode"**
4. Select the same location as Firestore

### **Step 5: Get Firebase Configuration**

1. In Firebase Console → **Project Settings** (gear icon)
2. Scroll down to **"Your apps"** section
3. Click **"Add app"** → **Web app** (</> icon)
4. Register your app with a nickname
5. **Copy the Firebase configuration object**

### **Step 6: Set Environment Variables**

Create a `.env.development` file in the root directory:

```bash
# .env.development
VITE_APP_FIREBASE_CONFIG='{"apiKey":"YOUR_API_KEY","authDomain":"your-project.firebaseapp.com","projectId":"your-project-id","storageBucket":"your-project.appspot.com","messagingSenderId":"YOUR_SENDER_ID","appId":"YOUR_APP_ID"}'
```

**Replace the values with your actual Firebase config!**

### **Step 7: Update Security Rules**

#### Firestore Rules (`firestore.rules`):
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

#### Storage Rules (`storage.rules`):
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

### **Step 8: Test the Setup**

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Open browser console** and check for errors

3. **Try to sign in**:
   - Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
   - Search for "Sign In"
   - Click "Sign In"

## 🔍 Troubleshooting

### **Common Issues:**

#### **1. "Firebase config not found"**
- ✅ Check that `.env.development` file exists
- ✅ Verify `VITE_APP_FIREBASE_CONFIG` is set correctly
- ✅ Restart the development server

#### **2. "Authentication not available"**
- ✅ Check browser console for Firebase errors
- ✅ Verify Firebase project has Authentication enabled
- ✅ Check that Email/Password is enabled in Firebase

#### **3. "Sign In button not showing"**
- ✅ Check that you're not already authenticated
- ✅ Verify the action is properly registered
- ✅ Check browser console for errors

#### **4. "Modal not opening"**
- ✅ Check for JavaScript errors in console
- ✅ Verify React components are properly imported
- ✅ Check that AuthProvider is wrapping the app

### **Debug Steps:**

1. **Check Environment Variables**:
   ```javascript
   console.log('Firebase Config:', import.meta.env.VITE_APP_FIREBASE_CONFIG);
   ```

2. **Check Firebase Initialization**:
   ```javascript
   // In browser console
   console.log('Firebase App:', firebaseApp);
   ```

3. **Check Authentication State**:
   ```javascript
   // In browser console
   console.log('Auth State:', auth.currentUser);
   ```

### **Quick Test:**

1. Open browser console
2. Type: `console.log(import.meta.env.VITE_APP_FIREBASE_CONFIG)`
3. You should see your Firebase config object
4. If you see `undefined`, the environment variable is not set

## 🚀 Alternative: Use Existing Firebase Project

If you want to use the existing Excalidraw Firebase project:

1. **Get the existing config** from the current setup
2. **Enable Authentication** in the existing project
3. **Update security rules** as shown above
4. **Set the environment variable** with the existing config

## 📞 Still Having Issues?

If you're still having problems:

1. **Check the browser console** for specific error messages
2. **Verify Firebase project setup** in Firebase Console
3. **Test with a simple Firebase app** first
4. **Check network requests** in browser dev tools

The most common issue is missing or incorrect Firebase configuration. Make sure your `.env.development` file is properly set up and the development server is restarted after making changes.
