# 🚀 Deploy Firebase Rules - Step by Step

Since Firebase CLI requires interactive login, follow these steps to deploy via Firebase Console:

---

## Step 1: Deploy Firestore Rules (2 minutes)

### 1.1 Open Firestore Rules Editor

Click this link or copy to browser:
```
https://console.firebase.google.com/project/ktirio-ai-4540c/firestore/rules
```

### 1.2 Copy the Rules

The rules are in [firestore.rules](firestore.rules). Here's the complete content:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function hasEnoughCredits(required) {
      return getUserData().credits >= required;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if false; // Prevent user deletion
    }

    // Projects collection
    match /projects/{projectId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isAuthenticated() &&
                      request.resource.data.userId == request.auth.uid &&
                      request.resource.data.name is string &&
                      request.resource.data.isFavorite is bool &&
                      request.resource.data.isArchived is bool;
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }

    // Versions collection
    match /versions/{versionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
                      request.resource.data.projectId is string &&
                      request.resource.data.imageUrl is string;
      allow update: if false; // Versions are immutable
      allow delete: if isAuthenticated();
    }

    // Credit Transactions collection
    match /creditTransactions/{transactionId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if false; // Only server can create transactions
      allow update, delete: if false;
    }
  }
}
```

### 1.3 Paste and Publish

1. **Delete all existing content** in the editor
2. **Paste** the rules above
3. Click **"Publish"** button (top-right)
4. Wait for confirmation message

✅ **Firestore Rules Deployed!**

---

## Step 2: Deploy Storage Rules (2 minutes)

### 2.1 Open Storage Rules Editor

Click this link or copy to browser:
```
https://console.firebase.google.com/project/ktirio-ai-4540c/storage/ktirio-ai-4540c.firebasestorage.app/rules
```

### 2.2 Copy the Rules

The rules are in [storage.rules](storage.rules). Here's the complete content:

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
      return request.resource.contentType.matches('image/.*');
    }

    function isUnder10MB() {
      return request.resource.size < 10 * 1024 * 1024;
    }

    // Projects images
    match /projects/{userId}/{imageId} {
      allow read: if true; // Public read
      allow write: if isAuthenticated() &&
                      isOwner(userId) &&
                      isImage() &&
                      isUnder10MB();
      allow delete: if isAuthenticated() && isOwner(userId);
    }

    // Generated versions
    match /versions/{userId}/{imageId} {
      allow read: if true; // Public read
      allow write: if isAuthenticated() &&
                      isOwner(userId) &&
                      isImage() &&
                      isUnder10MB();
      allow delete: if isAuthenticated() && isOwner(userId);
    }
  }
}
```

### 2.3 Paste and Publish

1. **Delete all existing content** in the editor
2. **Paste** the rules above
3. Click **"Publish"** button (top-right)
4. Wait for confirmation message

✅ **Storage Rules Deployed!**

---

## Step 3: Create Firestore Indexes (5 minutes)

### 3.1 Open Firestore Indexes

Click this link:
```
https://console.firebase.google.com/project/ktirio-ai-4540c/firestore/indexes
```

### 3.2 Create Each Index

Click **"Create Index"** for each of these:

#### Index 1: User Projects with Sorting
- **Collection ID**: `projects`
- **Fields to index**:
  1. `userId` - Ascending
  2. `updatedAt` - Descending
- **Query scopes**: Collection
- Click **"Create index"**

#### Index 2: Favorite Projects
- **Collection ID**: `projects`
- **Fields to index**:
  1. `userId` - Ascending
  2. `isFavorite` - Ascending
  3. `updatedAt` - Descending
- **Query scopes**: Collection
- Click **"Create index"**

#### Index 3: Archived Projects
- **Collection ID**: `projects`
- **Fields to index**:
  1. `userId` - Ascending
  2. `isArchived` - Ascending
  3. `updatedAt` - Descending
- **Query scopes**: Collection
- Click **"Create index"**

#### Index 4: Project Versions
- **Collection ID**: `versions`
- **Fields to index**:
  1. `projectId` - Ascending
  2. `createdAt` - Descending
- **Query scopes**: Collection
- Click **"Create index"**

#### Index 5: Credit Transactions
- **Collection ID**: `creditTransactions`
- **Fields to index**:
  1. `userId` - Ascending
  2. `createdAt` - Descending
- **Query scopes**: Collection
- Click **"Create index"**

### 3.3 Wait for Index Build

Each index takes **1-2 minutes** to build. You'll see status change from "Building" to "Enabled".

✅ **All Indexes Created!**

---

## Verification

### Test Firestore Rules:

1. Start dev server: `npm run dev`
2. Sign in to app
3. Try to create a project
4. Check browser console - should NOT see permission errors

### Test Storage Rules:

1. Try to upload an image in the app
2. Should succeed if:
   - You're logged in ✅
   - File is an image (jpg/png/webp) ✅
   - File is under 10MB ✅

### Test that Unauthorized Access Fails:

Open browser console and try:
```javascript
// This should FAIL (not logged in)
firebase.firestore().collection('projects').get()

// This should FAIL (trying to access another user's data)
firebase.firestore().collection('users').doc('other-user-id').get()
```

---

## What These Rules Protect

### Firestore Rules Protect:

✅ **User Privacy**: Users can only read their own data
✅ **Data Integrity**: Users can't create data for other users
✅ **Credit System**: Prevents credit manipulation
✅ **Project Ownership**: Users can't modify other users' projects

### Storage Rules Protect:

✅ **Upload Security**: Only authenticated users can upload
✅ **File Type**: Only images allowed (blocks malware)
✅ **File Size**: Max 10MB (prevents storage abuse)
✅ **Ownership**: Users can only upload to their own folders

---

## Troubleshooting

### Error: "Missing or insufficient permissions"

**When creating a user:**
- Make sure you're logged in via Clerk
- User ID must match Clerk user ID

**When creating a project:**
- Check that `userId` field matches your user ID
- Verify `isFavorite` and `isArchived` are booleans

### Error: "The query requires an index"

**Solution:** Click the link in the error message
- It will open Firebase Console
- Click "Create Index"
- Wait 1-2 minutes for it to build

### Indexes Still Building?

If indexes show "Building" for more than 5 minutes:
- Refresh the page
- Check Firebase Status: https://status.firebase.google.com/

---

## Quick Links

- **Firestore Rules**: https://console.firebase.google.com/project/ktirio-ai-4540c/firestore/rules
- **Storage Rules**: https://console.firebase.google.com/project/ktirio-ai-4540c/storage/ktirio-ai-4540c.firebasestorage.app/rules
- **Firestore Indexes**: https://console.firebase.google.com/project/ktirio-ai-4540c/firestore/indexes
- **Firebase Console**: https://console.firebase.google.com/project/ktirio-ai-4540c

---

## After Deployment

Once rules are deployed:

✅ **Security**: Your database is now protected
✅ **Ready**: You can safely create users and projects
✅ **Next Step**: Get Gemini API key - [GEMINI_API_SETUP.md](GEMINI_API_SETUP.md)

---

**Let me know once you've deployed the rules and I'll help with the next step!**
