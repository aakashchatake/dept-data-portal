# Department Data Collection Portal

A React-based web application for collecting annual report data from college departments. Features Firebase integration for data storage and an admin dashboard for viewing submissions.

## Features

- **Multi-section Data Collection**: Comprehensive form covering department details, academic results, achievements, events, and more
- **Real-time Auto-save**: Draft data is automatically saved to localStorage
- **Firebase Integration**: Secure cloud storage with anonymous authentication
- **Demo Mode**: Automatically falls back to local storage when Firebase is not configured (shows warning banner)
- **Admin Dashboard**: View and manage all submitted department reports
- **Responsive Design**: Works on desktop and mobile devices
- **Export Functionality**: Download data as JSON for backup

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Firebase Configuration**:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Firestore Database
   - Copy your Firebase config and set the following environment variables:
     ```javascript
     // In your deployment environment, set:
     window.__firebase_config = JSON.stringify({
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "your-app-id"
     });
     window.__app_id = "your-app-id";
     ```

3. **Run Development Server**:
   ```bash
   npm start
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Deployment

The app is designed to be deployed with Firebase configuration injected at runtime. For production deployment:

1. Build the app: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables for Firebase config

## Data Structure

The application collects data in the following structure:
- Department Details (name, HOD, faculty count, student counts)
- Academic Results (FY/SY/TY percentages and toppers)
- Student Achievements (competitions, awards, levels)
- Staff Achievements (FDPs, publications, etc.)
- Guest Lectures, Industrial Visits, Workshops
- MoUs, Placements, Events
- Photo metadata and Special Highlights

## Admin Features

- View all submitted reports in a dashboard
- Click on individual reports to see detailed data
- Real-time updates as new submissions arrive
- JSON export for data processing

## Technologies Used

- React 18
- Firebase (Auth + Firestore)
- Tailwind CSS
- Lucide React (icons)