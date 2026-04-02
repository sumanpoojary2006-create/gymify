# Training App

A mobile-friendly fitness attendance and progress tracker built with React and Vite.

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
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Optional AI calorie estimation:

```bash
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4.1-mini
```

If `OPENAI_API_KEY` is set in Vercel, meal logging will call the private `/api/estimate-calories` endpoint for AI estimates. If it is missing, the app falls back to the built-in local food table.

## Firebase Rules

Because this app currently uses its own lightweight signup flow instead of Firebase Authentication, Firebase must allow public access for your group to use it from their phones.

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
6. Add `OPENAI_API_KEY` if you want AI calorie estimation.
7. Deploy and share the public URL.

### Netlify

1. Push this project to GitHub.
2. Import the repo into Netlify.
3. Set the build command to `npm run build`.
4. Set the publish directory to `dist`.
5. Add all `VITE_FIREBASE_*` environment variables in Netlify.
6. Add `OPENAI_API_KEY` if you want AI calorie estimation.
7. Deploy and share the public URL.

## Build

```bash
npm run build
```

## Notes

- When Firebase is connected, the app shows `Shared cloud sync` in the header.
- When Firebase is not configured, the app shows `Local-only mode`.
- Attendance is tracked on a month calendar in the app.
