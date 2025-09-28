# Firebase Services Audit Report

## 🔍 **Overview**

This audit identifies all places where Firebase services are being used in the Excalidraw codebase. Firebase is primarily used for **collaboration features**, **file storage**, and **scene persistence**.

---

## 📊 **Firebase Services Used**

### **1. Firestore Database**
- **Purpose**: Store encrypted scene data for collaboration
- **Collections**: `scenes` (room-based scene storage)

### **2. Firebase Storage**
- **Purpose**: Store uploaded files and images
- **Paths**: 
  - `/files/rooms/{roomId}/` (collaboration files)
  - `/files/shareLinks/{shareLinkId}/` (shared link files)

### **3. Firebase Authentication**
- **Purpose**: User management (currently not actively used)

---

## 📁 **Files Using Firebase Services**

### **Core Firebase Integration**

#### **1. `excalidraw-app/data/firebase.ts`** ⭐ **PRIMARY FIREBASE MODULE**
- **Firebase Services**: Firestore, Storage
- **Key Functions**:
  - `saveToFirebase()` - Save scene data to Firestore
  - `loadFromFirebase()` - Load scene data from Firestore
  - `saveFilesToFirebase()` - Upload files to Storage
  - `loadFilesFromFirebase()` - Download files from Storage
  - `isSavedToFirebase()` - Check if scene is saved
- **Firebase Imports**:
  ```typescript
  import { initializeApp } from "firebase/app";
  import { getFirestore, doc, getDoc, runTransaction, Bytes } from "firebase/firestore";
  import { getStorage, ref, uploadBytes } from "firebase/storage";
  ```

#### **2. `excalidraw-app/collab/Collab.tsx`** ⭐ **COLLABORATION INTEGRATION**
- **Firebase Usage**: Scene persistence, file management
- **Key Functions**:
  - `saveCollabRoomToFirebase()` - Save collaboration room data
  - `fetchImageFilesFromFirebase()` - Load images for collaboration
  - File manager integration with Firebase Storage
- **Firebase Imports**:
  ```typescript
  import { isSavedToFirebase, loadFilesFromFirebase, loadFromFirebase, saveFilesToFirebase, saveToFirebase } from "../data/firebase";
  ```

#### **3. `excalidraw-app/data/index.ts`** ⭐ **EXPORT FUNCTIONALITY**
- **Firebase Usage**: File storage for shareable links
- **Key Functions**:
  - `exportToBackend()` - Uses `saveFilesToFirebase()` for shareable links
- **Firebase Imports**:
  ```typescript
  import { saveFilesToFirebase } from "./firebase";
  ```

#### **4. `excalidraw-app/App.tsx`** ⭐ **MAIN APP INTEGRATION**
- **Firebase Usage**: File loading for shared links
- **Key Functions**:
  - Uses `loadFilesFromFirebase()` for loading shared link files
- **Firebase Imports**:
  ```typescript
  import { loadFilesFromFirebase } from "./data/firebase";
  ```

### **Configuration Files**

#### **5. `excalidraw-app/app_constants.ts`**
- **Firebase Usage**: Storage path configuration
- **Constants**:
  ```typescript
  export const FIREBASE_STORAGE_PREFIXES = {
    shareLinkFiles: `/files/shareLinks`,
    collabFiles: `/files/rooms`,
  };
  ```

#### **6. `excalidraw-app/vite-env.d.ts` & `packages/excalidraw/vite-env.d.ts`**
- **Firebase Usage**: Environment variable type definitions
- **Variables**:
  ```typescript
  VITE_APP_FIREBASE_CONFIG: string;
  ```

#### **7. `excalidraw-app/package.json`**
- **Firebase Usage**: Dependency declaration
- **Dependencies**:
  ```json
  "firebase": "11.3.1"
  ```

### **Test Files**

#### **8. `excalidraw-app/tests/collab.test.tsx`**
- **Firebase Usage**: Mock Firebase functions for testing
- **Mock Functions**:
  ```typescript
  const loadFromFirebase = async () => null;
  const saveToFirebase = () => {};
  const loadFilesFromFirebase = async () => ({ loadedFiles: [], erroredFiles: new Map() });
  const saveFilesToFirebase = async () => ({ savedFiles: [], erroredFiles: [] });
  ```

### **Firebase Project Configuration**

#### **9. `firebase-project/` Directory**
- **Files**:
  - `firebase.json` - Firebase project configuration
  - `firestore.rules` - Firestore security rules
  - `storage.rules` - Storage security rules
  - `firestore.indexes.json` - Database indexes
  - `.firebaserc` - Project aliases

---

## 🔧 **Firebase Integration Patterns**

### **1. Scene Data Storage (Firestore)**
```typescript
// Save scene to Firestore
const storedScene = await runTransaction(firestore, async (transaction) => {
  const docRef = doc(firestore, "scenes", roomId);
  // ... transaction logic
});
```

### **2. File Storage (Firebase Storage)**
```typescript
// Upload files to Storage
const storageRef = ref(storage, `${prefix}/${id}`);
await uploadBytes(storageRef, buffer, {
  cacheControl: `public, max-age=${FILE_CACHE_MAX_AGE_SEC}`,
});
```

### **3. File Download (Direct HTTP)**
```typescript
// Download files via direct HTTP
const url = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_CONFIG.storageBucket}/o/${encodeURIComponent(prefix)}%2F${id}`;
const response = await fetch(`${url}?alt=media`);
```

---

## 📈 **Data Flow**

### **Collaboration Flow**:
1. **User joins room** → `Collab.tsx`
2. **Scene data saved** → `saveToFirebase()` → Firestore
3. **Files uploaded** → `saveFilesToFirebase()` → Storage
4. **Other users load** → `loadFromFirebase()` + `loadFilesFromFirebase()`

### **Shareable Link Flow**:
1. **User exports** → `exportToBackend()` → `saveFilesToFirebase()`
2. **Files stored** → Storage at `/files/shareLinks/{id}/`
3. **Link shared** → Others load via `loadFilesFromFirebase()`

---

## 🔒 **Security & Access Patterns**

### **Current Security Rules**:
- **Firestore**: Allow all reads/writes (`allow get, write: if true`)
- **Storage**: Allow all reads/writes for rooms and shareLinks
- **No authentication required** (very permissive)

### **Data Encryption**:
- **Scene data**: Encrypted with room keys before storage
- **Files**: Compressed and encrypted before upload
- **Keys**: Never stored in Firebase (passed via URL hash)

---

## 💰 **Cost Implications**

### **Firestore Operations**:
- **Reads**: Every scene load, collaboration sync
- **Writes**: Every scene save, collaboration update
- **Transactions**: Used for scene updates

### **Storage Operations**:
- **Uploads**: Image files, collaboration files
- **Downloads**: File retrieval, image loading
- **Storage**: File persistence

---

## 🚨 **Migration Impact Assessment**

### **High Impact** (Core functionality):
- `excalidraw-app/data/firebase.ts` - **CRITICAL**
- `excalidraw-app/collab/Collab.tsx` - **CRITICAL**
- `excalidraw-app/data/index.ts` - **HIGH**
- `excalidraw-app/App.tsx` - **HIGH**

### **Medium Impact** (Configuration):
- `excalidraw-app/app_constants.ts` - **MEDIUM**
- Environment files - **MEDIUM**

### **Low Impact** (Tests/Config):
- Test files - **LOW**
- Firebase project config - **LOW**

---

## 🎯 **Migration Strategy**

### **Option 1: Replace Firebase Completely**
- Replace Firestore with your own database
- Replace Storage with your own file storage
- **Effort**: High
- **Benefit**: Full control

### **Option 2: Use Your Own Firebase Project**
- Keep Firebase services, change project
- Update configuration only
- **Effort**: Low
- **Benefit**: Quick migration

### **Option 3: Hybrid Approach**
- Keep Firebase for some features
- Replace with custom backend for others
- **Effort**: Medium
- **Benefit**: Gradual migration

---

## 📋 **Action Items for Migration**

1. **Update Firebase Configuration**:
   - Change `VITE_APP_FIREBASE_CONFIG` in environment files
   - Update `.firebaserc` with your project ID

2. **Deploy Security Rules**:
   - Deploy Firestore and Storage rules to your project
   - Consider implementing proper authentication

3. **Test All Features**:
   - Collaboration functionality
   - File uploads/downloads
   - Shareable links
   - Scene persistence

4. **Monitor Usage**:
   - Set up Firebase monitoring
   - Track costs and usage patterns

---

## 🔗 **Related Files**

- **Migration Guide**: `FIREBASE_MIGRATION_GUIDE.md`
- **Migration Script**: `scripts/migrate-firebase.js`
- **Firebase Config**: `firebase-project/` directory
- **Environment Files**: `.env.development`, `.env.production`
