# Training App

A mobile-friendly 60-day lean challenge tracker built with React and Vite.

## What Changed

This app now supports two data modes:

- `Firebase enabled`: everyone sees the same shared progress from any phone or browser.
- `Firebase not configured`: the app falls back to browser `localStorage` for local-only usage.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

## Make Progress Shared Across Phones

The website must use a shared database, not only browser storage. This project is already wired for Firebase Realtime Database.

1. Create a Firebase project.
2. Enable `Realtime Database`.
3. In Firebase project settings, create a `Web app`.
4. Copy `.env.example` to `.env.local`.
5. Fill in the Firebase values from your project.

Example:

```bash
cp .env.example .env.local
```

Required environment variables:

```bash
VITE_FIREBASE_API_KEY= AIzaSyAfrqYS_VsC2WHPtyQ6bJmiyvwNeOl53ZM
VITE_FIREBASE_AUTH_DOMAIN= gymify-654c7.firebaseapp.com
VITE_FIREBASE_DATABASE_URL= https://gymify-654c7-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID= gymify-654c7
VITE_FIREBASE_STORAGE_BUCKET= gymify-654c7.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID= 1035716451486
VITE_FIREBASE_APP_ID= 1:1035716451486:web:69ddfb0228bd694ea3af8f
VITE_FIREBASE_MEASUREMENTID=  G-XD4ELFQLH6
```

## Firebase Rules

Because this app does not have login yet, Firebase must allow public access for your group to use it from their phones.

Use rules like this if you want anyone with the link to read and update the challenge:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Important: this means anyone with your app link can change the data. If you want only approved users to edit progress, the next step would be adding Firebase Authentication.

## Deploy

You can host this as a static site on Vercel or Netlify.

### Vercel

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist`.
5. Add all `VITE_FIREBASE_*` environment variables in Vercel.
6. Deploy and share the public URL.

### Netlify

1. Push this project to GitHub.
2. Import the repo into Netlify.
3. Set the build command to `npm run build`.
4. Set the publish directory to `dist`.
5. Add all `VITE_FIREBASE_*` environment variables in Netlify.
6. Deploy and share the public URL.

## Build

```bash
npm run build
```

## Notes

- When Firebase is connected, the app shows `Shared cloud sync` in the header.
- When Firebase is not configured, the app shows `Local-only mode`.
- The challenge start date is currently set to `2026-04-02` in `src/utils/storage.js`.
