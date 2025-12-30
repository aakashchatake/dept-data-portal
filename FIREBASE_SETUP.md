# Firebase Setup Instructions

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: `dept-data-portal` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firebase Services

### Authentication
1. In Firebase Console, go to **Build** > **Authentication**
2. Click **Get Started**
3. Enable **Anonymous** sign-in method
4. Click **Save**

### Firestore Database
1. Go to **Build** > **Firestore Database**
2. Click **Create database**
3. Start in **production mode**
4. Choose a location (closest to your users)
5. Click **Enable**

### Set Firestore Security Rules
Go to **Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **Publish**

## 3. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web** icon (</>)
4. Register app with nickname: `dept-portal-web`
5. Copy the **firebaseConfig** object

## 4. Update Application Config

Replace the content in `public/config.js`:

```javascript
window.__firebase_config = JSON.stringify({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

window.__app_id = "dept-portal";
window.__initial_auth_token = null;
```

## 5. Deploy to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd react-dept-portal
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" > "Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Click "Deploy"

## 6. Post-Deployment

1. **Update Firebase Authorized Domains**:
   - Go to Firebase Console > Authentication > Settings
   - Add your Vercel domain to Authorized domains
   - Example: `your-app.vercel.app`

2. **Test the Application**:
   - Visit your deployed URL
   - The yellow "Demo Mode" banner should disappear
   - Test form submission
   - Check Firestore for saved data

## 7. Share with Departments

Share the deployed URL with department HODs:
- Example: `https://dept-portal.vercel.app`
- Each department can fill and submit their annual report
- You can view all submissions in the Admin Dashboard

## Troubleshooting

- **Demo Mode still showing**: Check that Firebase config in `public/config.js` is correct
- **Authentication errors**: Verify Anonymous auth is enabled in Firebase
- **Data not saving**: Check Firestore security rules
- **CORS errors**: Add your domain to Firebase Authorized domains

## Cost Considerations

- **Firebase Free Tier**:
  - 50,000 reads/day
  - 20,000 writes/day
  - 1 GB storage
  - Should be sufficient for departmental use

- **Vercel Free Tier**:
  - Unlimited deployments
  - 100 GB bandwidth/month
  - Automatic HTTPS
  - Perfect for this application

Both services are free for moderate usage!
