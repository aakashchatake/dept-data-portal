# React Department Data Portal - Deployment Guide

## Overview
This React application provides a web-based interface for departments to submit annual report data. It uses Firebase for authentication and data storage.

## Local Development
```bash
npm install
npm start
```
The app will run on http://localhost:3000

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Anonymous sign-in)
4. Enable Firestore Database

### 2. Configure Firebase Security Rules

#### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to artifacts collection for authenticated users
    match /artifacts/{appId}/public/data/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage Rules (if needed):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Get Firebase Configuration
In Firebase Console > Project Settings > General > Your apps > Web app:
- Copy the Firebase config object

## Deployment Options

### Option 1: Firebase Hosting (Recommended)

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase in your project:**
   ```bash
   cd react-dept-portal
   firebase init hosting
   ```

3. **Build the app:**
   ```bash
   npm run build
   ```

4. **Configure Firebase config injection:**
   Create `firebase.json`:
   ```json
   {
     "hosting": {
       "public": "build",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ],
       "headers": [
         {
           "source": "**/*.js",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "max-age=31536000"
             }
           ]
         }
       ]
     }
   }
   ```

5. **Deploy:**
   ```bash
   firebase deploy
   ```

6. **Set Environment Variables:**
   In Firebase Console > Hosting > Custom domain settings, or use Firebase Functions to inject config.

### Option 2: Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables:**
   In Vercel dashboard, add:
   - `__firebase_config`: Your Firebase config JSON string
   - `__app_id`: Your app ID
   - `__initial_auth_token`: (Optional) Custom auth token

### Option 3: Netlify Deployment

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Drag and drop the `build` folder to Netlify
   - Or connect your Git repository

3. **Set Environment Variables:**
   In Netlify dashboard > Site settings > Environment variables

## Environment Configuration

For production deployment, you need to inject the Firebase configuration. Here are different approaches:

### Approach 1: Build-time Injection
Modify `public/config.js` with your actual Firebase config before building.

### Approach 2: Runtime Injection
Use your hosting platform's environment variable injection or a serverless function.

### Approach 3: Firebase Functions
Create a Firebase Function that serves the config dynamically.

## Usage Instructions for Departments

1. **Access the Portal:**
   - Share the deployed URL with department HODs
   - Each department can access the form anonymously

2. **Data Submission:**
   - Fill out all required sections
   - Data is auto-saved locally
   - Submit to Firebase when complete

3. **Admin Dashboard:**
   - Access admin view to see all submissions
   - Download data as JSON
   - Monitor submission progress

## Security Considerations

- Anonymous authentication allows easy access but limits abuse
- Firestore rules restrict access to authenticated users only
- Consider implementing custom authentication for production use
- Regularly backup Firestore data

## Troubleshooting

### Common Issues:

1. **Firebase Config Not Loading:**
   - Ensure `public/config.js` contains valid Firebase config
   - Check browser console for errors

2. **Authentication Errors:**
   - Verify Firebase project has Anonymous authentication enabled
   - Check Firestore security rules

3. **Data Not Saving:**
   - Confirm user is authenticated
   - Check Firestore permissions
   - Verify network connectivity

## Support

For technical issues, check:
- Firebase Console for authentication and database logs
- Browser developer tools for client-side errors
- Hosting platform logs for deployment issues