# KaamConnect

KaamConnect is a simple, mobile-first job board for daily wage workers and small employers.
It is built with HTML5, CSS3, and Vanilla JavaScript, with Appwrite as backend.

## Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)
- Backend: Appwrite (Auth, Databases, Storage, Functions, Realtime)
- Appwrite SDK: Web SDK v14 via CDN
- Fonts: Baloo 2, Hind, Noto Sans Devanagari
- Icons: Phosphor Icons CDN
- i18n: Custom JS switcher (EN / HI / MR)

## Files

- appwrite.js
- auth.js
- i18n.js
- main.js
- style.css
- index.html
- login.html
- register.html
- search.html
- worker-dashboard.html
- employer-dashboard.html
- worker-profile.html
- locales/en.json
- locales/hi.json
- locales/mr.json

## Appwrite Setup

1. Create an Appwrite project.
2. In appwrite.js, update:
   - endpoint
   - projectId
   - databaseId
   - workersCollectionId
   - jobsCollectionId
   - applicationsCollectionId
   - reviewsCollectionId
   - workerPhotosBucketId
3. Create a Database and Collections:
   - workers
   - jobs
   - applications
   - reviews
4. Suggested worker fields:
   - name (string)
   - phone (string)
   - city (string)
   - category (string)
   - rate (integer)
   - experience (integer)
   - available (boolean)
   - rating (float)
   - reviewsCount (integer)
5. Suggested jobs fields:
   - employerId (string)
   - category (string)
   - city (string)
   - rate (integer)
   - duration (string)
   - status (string)
6. Suggested applications fields:
   - jobId (string)
   - workerId (string)
   - status (string)
7. Create Storage bucket for worker photos.
8. Configure permissions so users can only edit their own profile and postings.
9. Enable Phone/Auth flow according to your production strategy.

## Run Locally

Use any static server from project root.

Example with VS Code Live Server:

1. Open folder in VS Code.
2. Start Live Server on index.html.

Or with Node:

```bash
npx serve .
```

## UX Notes

- Minimum touch target size is 52px.
- Friendly messaging for low-tech users.
- Bottom sheets on mobile for filter and posting actions.
- Sticky CTA on profile page.
- Skeleton loaders, toasts, and full-screen success animations included.
