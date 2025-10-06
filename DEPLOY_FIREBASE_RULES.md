# 🔒 Deploy Firebase Security Rules

## Why Deploy Rules?

Firebase Security Rules protect your Firestore database and Storage buckets from unauthorized access. Without deployed rules, your data is vulnerable.

---

## Option 1: Via Firebase Console (Recommended - 2 minutes)

### Firestore Rules

1. Open Firestore Rules:
   ```
   https://console.firebase.google.com/project/ktirio-ai-4540c/firestore/rules
   ```

2. Copy the content from [firestore.rules](firestore.rules)

3. Paste into the editor

4. Click **"Publish"**

5. Verify deployment message appears

### Storage Rules

1. Open Storage Rules:
   ```
   https://console.firebase.google.com/project/ktirio-ai-4540c/storage/ktirio-ai-4540c.firebasestorage.app/rules
   ```

2. Copy the content from [storage.rules](storage.rules)

3. Paste into the editor

4. Click **"Publish"**

5. Verify deployment message appears

---

## Option 2: Via Firebase CLI (Advanced)

### Prerequisites

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project (if not already done)
firebase init
```

### Deploy Rules

```bash
# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Storage rules
firebase deploy --only storage

# Deploy both
firebase deploy --only firestore:rules,storage
```

---

## Firestore Rules Explained

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;  // User must be logged in
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;  // User owns the data
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId);  // Users can only read their own data
      allow create: if isAuthenticated() && request.auth.uid == userId;  // Can create own user doc
      allow update: if isOwner(userId);  // Can only update own data
    }

    // Projects collection
    match /projects/{projectId} {
      allow read: if isOwner(resource.data.userId);  // Can read own projects
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;  // Can create projects for self
      allow update, delete: if isOwner(resource.data.userId);  // Can modify own projects
    }

    // Versions collection (nested under projects)
    match /projects/{projectId}/versions/{versionId} {
      allow read: if isAuthenticated();  // Any authenticated user can read versions
      allow write: if isAuthenticated();  // Any authenticated user can write versions
    }

    // Credit transactions
    match /creditTransactions/{transactionId} {
      allow read: if isOwner(resource.data.userId);  // Users can read their own transactions
      allow create: if isAuthenticated();  // Can create transactions
    }
  }
}
```

### Key Security Features:

✅ **Authentication Required**: All operations require user to be logged in via Clerk
✅ **Data Ownership**: Users can only access their own data
✅ **Create Protection**: Users can't create data for other users
✅ **Update Protection**: Users can't modify other users' data

---

## Storage Rules Explained

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isImage() {
      return request.resource.contentType.matches('image/.*');  // Only image files
    }

    function isUnder10MB() {
      return request.resource.size < 10 * 1024 * 1024;  // Max 10MB
    }

    // Projects folder
    match /projects/{userId}/{imageId} {
      allow read: if true;  // Public read access (for displaying images)
      allow write: if isAuthenticated()  // Must be logged in
                   && isOwner(userId)     // Must be uploading to own folder
                   && isImage()           // Must be an image
                   && isUnder10MB();      // Must be under 10MB
    }

    // Versions folder
    match /versions/{userId}/{imageId} {
      allow read: if true;
      allow write: if isAuthenticated() && isOwner(userId) && isImage() && isUnder10MB();
    }
  }
}
```

### Key Security Features:

✅ **Public Read**: Anyone can view images (needed for sharing)
✅ **Authenticated Write**: Only logged-in users can upload
✅ **Folder Ownership**: Users can only upload to their own folders
✅ **File Type Validation**: Only image files accepted (jpeg, png, webp)
✅ **Size Limit**: Maximum 10MB per file

---

## How to Verify Rules Are Working

### Test 1: Unauthenticated Access (Should Fail)

```typescript
// Try to read projects without being logged in
// Should fail with: "Missing or insufficient permissions"
const projects = await getDocs(collection(db, 'projects'));
```

### Test 2: Access Other User's Data (Should Fail)

```typescript
// Try to read another user's project
// Should fail with: "Missing or insufficient permissions"
const otherUserProject = await getDoc(doc(db, 'projects', 'other-user-project-id'));
```

### Test 3: Upload Invalid File (Should Fail)

```typescript
// Try to upload a PDF file
// Should fail with: "Permission denied"
const pdfFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
await uploadBytes(ref(storage, 'projects/user-id/file.pdf'), pdfFile);
```

### Test 4: Valid Operations (Should Succeed)

```typescript
// Create own user document ✅
await setDoc(doc(db, 'users', currentUser.id), userData);

// Read own projects ✅
const projects = await getDocs(
  collection(db, 'projects'),
  where('userId', '==', currentUser.id)
);

// Upload image to own folder ✅
await uploadImage(imageFile, currentUser.id, 'projects');
```

---

## Firestore Indexes

After deploying rules, you'll also need to create indexes for complex queries.

### Required Indexes:

1. **User Projects with Sorting**
   - Collection: `projects`
   - Fields:
     - `userId` (Ascending)
     - `updatedAt` (Descending)

2. **Favorite Projects**
   - Collection: `projects`
   - Fields:
     - `userId` (Ascending)
     - `isFavorite` (Ascending)
     - `updatedAt` (Descending)

3. **Archived Projects**
   - Collection: `projects`
   - Fields:
     - `userId` (Ascending)
     - `isArchived` (Ascending)
     - `updatedAt` (Descending)

4. **Project Versions**
   - Collection: `versions`
   - Fields:
     - `projectId` (Ascending)
     - `createdAt` (Descending)

5. **Credit Transactions**
   - Collection: `creditTransactions`
   - Fields:
     - `userId` (Ascending)
     - `createdAt` (Descending)

### How to Create Indexes:

**Option A: Wait for Error (Easiest)**
1. Run the app and perform a filtered query
2. Check browser console for error message
3. Click the provided index creation link
4. Wait for index to build (~1-2 minutes)

**Option B: Manual Creation**
1. Go to: https://console.firebase.google.com/project/ktirio-ai-4540c/firestore/indexes
2. Click "Create Index"
3. Enter collection and fields from list above
4. Click "Create"

---

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Cause**: Rules not deployed or user not authenticated

**Solution:**
1. Verify rules are published in Firebase Console
2. Check user is logged in via Clerk
3. Verify `request.auth.uid` matches `userId` in query

### Error: "The query requires an index"

**Cause**: Complex query needs composite index

**Solution:**
Click the link in the error message to create the index automatically

### Error: "Permission denied" (Storage)

**Cause**: File doesn't meet validation rules

**Solution:**
- Check file is an image (jpeg/png/webp)
- Verify file size is under 10MB
- Ensure uploading to correct user folder

---

## Next Steps

After deploying rules:

1. ✅ Test authentication flow
2. ✅ Create a project
3. ✅ Upload an image
4. ✅ Verify security by trying to access another user's data
5. ➡️ Configure Gemini API for text generation
6. ➡️ Configure Imagen for image generation

**Documentation:** [SETUP_STATUS.md](SETUP_STATUS.md)
